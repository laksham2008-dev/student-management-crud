from rest_framework import serializers
from .models import CollegeSettings, Department, UserAccess
from .models import CollegeSettings, Department, UserAccess
from .permissions import get_user_college
from students.models import Student


class CollegeSettingsSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(source='admin_user.email', read_only=True, allow_null=True)
    class Meta:
        model = CollegeSettings
        fields = ['id', 'college_name', 'admin_email', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_college_name(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("College name is required and cannot be blank.")
        if len(stripped) > 200:
            raise serializers.ValidationError("College name cannot exceed 200 characters.")
        return stripped


class DepartmentSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField(read_only=True)
    male_count = serializers.SerializerMethodField(read_only=True)
    female_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'student_count', 'male_count', 'female_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_student_count(self, obj):
        return Student.objects.filter(department=obj).count()

    def get_male_count(self, obj):
        return Student.objects.filter(department=obj, gender='male').count()

    def get_female_count(self, obj):
        return Student.objects.filter(department=obj, gender='female').count()

    def validate_name(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Department name is required and cannot be blank.")
        if len(stripped) > 100:
            raise serializers.ValidationError("Department name cannot exceed 100 characters.")

        # Check uniqueness (case-insensitive), excluding current instance on update
        instance = getattr(self, 'instance', None)
        query = Department.objects.filter(name__iexact=stripped)
        if instance:
            query = query.exclude(pk=instance.pk)
        if query.exists():
            raise serializers.ValidationError(
                f"A department named '{stripped}' already exists."
            )
        return stripped

    def validate_code(self, value):
        return value.strip().upper()


class UserAccessSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserAccess
        fields = ['id', 'username', 'role', 'can_view_students', 'can_add_students', 'can_edit_students', 'can_delete_students', 'can_manage_departments']

