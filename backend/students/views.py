from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for Student entity providing complete CRUD operations:
    - GET /api/students/ : List all students (supports optional ?search= query)
    - GET /api/students/{id}/ : Retrieve single student details
    - POST /api/students/ : Create a new student
    - PUT /api/students/{id}/ : Update an existing student completely
    - PATCH /api/students/{id}/ : Partially update student fields
    - DELETE /api/students/{id}/ : Delete a student record
    """
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer

    def get_queryset(self):
        """
        Optionally filters students by search query across name, register_number, department, email.
        """
        queryset = Student.objects.all().order_by('-created_at')
        search_query = self.request.query_params.get('search', None)
        if search_query:
            search_query = search_query.strip()
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(register_number__icontains=search_query) |
                Q(department__icontains=search_query) |
                Q(email__icontains=search_query)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        """
        Create a new student with strict validation. Returns 201 Created.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "success": True,
                "message": "Student added successfully.",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve single student record. Returns 200 OK or 404 Not Found.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {
                "success": True,
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """
        Update an existing student record completely (PUT) or partially (PATCH). Returns 200 OK.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "success": True,
                "message": "Student updated successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        """
        Delete a student record. Returns 204 No Content.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {
                "success": True,
                "message": "Student deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )
