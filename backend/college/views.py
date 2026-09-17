from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CollegeSettings, Department, UserAccess
from .serializers import CollegeSettingsSerializer, DepartmentSerializer
from .serializers import UserAccessSerializer
from students.models import Student
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.db import transaction
from django.db.models import Q
from .permissions import DepartmentActionPermission, get_user_college


class CollegeSettingsView(APIView):
    """
    Singleton-style view for college settings.

    GET   /api/settings/ → Returns the college settings, or 200 with configured=false when not set up yet.
    POST  /api/settings/ → Creates or updates the college settings (admin only).
    PATCH /api/settings/ → Updates the existing college settings (admin only).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            settings_obj = CollegeSettings.objects.first()
            if settings_obj is None:
                return Response(
                    {
                        "success": False,
                        "configured": False,
                        "message": "College settings not configured yet."
                    },
                    status=status.HTTP_200_OK
                )
            serializer = CollegeSettingsSerializer(settings_obj)
            return Response(
                {
                    "success": True,
                    "configured": True,
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        if not CollegeSettings.objects.filter(admin_user=request.user).exists() and not request.user.is_superuser:
            return Response({'detail': 'Only the college admin can change institution settings.'}, status=status.HTTP_403_FORBIDDEN)
        # If already exists, update instead
        existing = CollegeSettings.objects.first()
        if existing:
            serializer = CollegeSettingsSerializer(existing, data=request.data, partial=True)
        else:
            serializer = CollegeSettingsSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            {
                "success": True,
                "message": "College settings saved successfully.",
                "data": CollegeSettingsSerializer(instance).data
            },
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        if not CollegeSettings.objects.filter(admin_user=request.user).exists() and not request.user.is_superuser:
            return Response({'detail': 'Only the college admin can change institution settings.'}, status=status.HTTP_403_FORBIDDEN)
        existing = CollegeSettings.objects.first()
        if not existing:
            return Response(
                {"success": False, "error": "College settings not yet configured."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CollegeSettingsSerializer(existing, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        email = str(request.data.get('admin_email', '')).strip().lower()
        if email and existing.admin_user:
            existing.admin_user.email = email
            existing.admin_user.username = email
            existing.admin_user.save(update_fields=['email', 'username'])
        return Response(
            {
                "success": True,
                "message": "College name updated successfully.",
                "data": CollegeSettingsSerializer(instance).data
            },
            status=status.HTTP_200_OK
        )


class SetupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'configured': CollegeSettings.objects.filter(admin_user__isnull=False).exists()})

    @transaction.atomic
    def post(self, request):
        existing = CollegeSettings.objects.first()
        if existing and existing.admin_user_id:
            return Response({'detail': 'Institution setup is already complete.'}, status=status.HTTP_409_CONFLICT)
        name = str(request.data.get('college_name', '')).strip()
        admin_name = str(request.data.get('admin_name', '')).strip()
        email = str(request.data.get('email', '')).strip().lower()
        password = request.data.get('password', '')
        confirm = request.data.get('confirm_password', '')
        if not name or not admin_name or not email or not password or password != confirm:
            return Response({'detail': 'College name, administrator name, email, and matching passwords are required.'}, status=400)
        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'}, status=400)
        if User.objects.filter(username=email).exists():
            return Response({'detail': 'That admin email is already registered.'}, status=400)
        user = User.objects.create_user(username=email, email=email, password=password, first_name=admin_name, is_staff=True)
        settings_obj = existing or CollegeSettings.objects.create(college_name=name)
        settings_obj.college_name = name
        settings_obj.admin_user = user
        settings_obj.save(update_fields=['college_name', 'admin_user', 'updated_at'])
        UserAccess.objects.update_or_create(
            user=user,
            defaults={
                'college': settings_obj,
                'role': 'admin',
                'can_view_students': True,
                'can_add_students': True,
                'can_edit_students': True,
                'can_delete_students': True,
                'can_manage_departments': True,
            },
        )
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'data': CollegeSettingsSerializer(settings_obj).data}, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        settings_obj = CollegeSettings.objects.first()
        allowed_user = User.objects.filter(username=email).filter(
            Q(college_settings=settings_obj) | Q(access_profile__college=settings_obj)
        ).first() if settings_obj else None
        if not allowed_user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        user = authenticate(username=email, password=request.data.get('password', ''))
        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'data': CollegeSettingsSerializer(settings_obj).data if settings_obj else None})


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'success': True})


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    Department CRUD ViewSet.

    GET    /api/departments/       → List all departments
    GET    /api/departments/{id}/  → Retrieve a single department
    POST   /api/departments/       → Create a new department
    PUT    /api/departments/{id}/  → Update a department completely
    PATCH  /api/departments/{id}/  → Partially update a department
    DELETE /api/departments/{id}/  → Delete a department (only if no students assigned)
    """
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [DepartmentActionPermission]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = Department.objects.all().order_by('name')
        college = get_user_college(self.request.user)
        return queryset.filter(college=college) if college else queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(college=get_user_college(request.user))
        return Response(
            {
                "success": True,
                "message": "Department created successfully.",
                "data": DepartmentSerializer(instance).data
            },
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        """
        Update an existing department completely (PUT) or partially (PATCH). Returns 200 OK.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Department updated successfully.",
                "data": DepartmentSerializer(instance).data
            },
            status=status.HTTP_200_OK
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'count': queryset.count(), 'data': serializer.data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        student_count = Student.objects.filter(department=instance).count()
        if student_count > 0:
            return Response({'success': False, 'message': f"Cannot delete '{instance.name}' because students are currently assigned to it."}, status=status.HTTP_400_BAD_REQUEST)
        name = instance.name
        instance.delete()
        return Response({'success': True, 'message': f"Department '{name}' deleted successfully."})


class UserAccessViewSet(viewsets.ModelViewSet):
    queryset = UserAccess.objects.select_related('user').all()
    serializer_class = UserAccessSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        if not self.request.user.is_staff and not CollegeSettings.objects.filter(admin_user=self.request.user).exists():
            return UserAccess.objects.filter(user=self.request.user)
        return super().get_queryset()

    def partial_update(self, request, *args, **kwargs):
        """
        Update role/permission flags for a user. Only allow-listed, validated fields can be
        changed; invalid values are rejected with 400 Bad Request instead of being stored.
        """
        if not CollegeSettings.objects.filter(admin_user=request.user).exists() and not request.user.is_superuser:
            return Response({'detail': 'Only the college admin can change permissions.'}, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        allowed_fields = [
            'role',
            'can_view_students',
            'can_add_students',
            'can_edit_students',
            'can_delete_students',
            'can_manage_departments',
        ]
        unexpected = [field for field in request.data if field not in allowed_fields]
        if unexpected:
            return Response(
                {'detail': f"Cannot update the following field(s): {', '.join(sorted(unexpected))}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        if not CollegeSettings.objects.filter(admin_user=request.user).exists() and not request.user.is_superuser:
            return Response({'detail': 'Only the college admin can create users.'}, status=status.HTTP_403_FORBIDDEN)
        email = str(request.data.get('email', '')).strip().lower()
        password = request.data.get('password', '')
        if not email or len(password) < 8:
            return Response({'detail': 'A valid email and password of at least 8 characters are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=email).exists():
            return Response({'detail': 'That user already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=email, email=email, password=password)
        access = UserAccess.objects.create(user=user, college=CollegeSettings.objects.filter(admin_user=request.user).first())
        return Response(UserAccessSerializer(access).data, status=status.HTTP_201_CREATED)

