import re
from rest_framework import serializers
from .models import Student
from college.models import Department
from college.permissions import get_user_college


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id',
            'name',
            'register_number',
            'email',
            'gender',
            'department',
            'department_name',
            'year',
            'phone',
            'cutoff_mark',
            'previous_semester_percentage',
            'cgpa',
            'admission_year',
            'backlog_count',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'department': {'required': True, 'allow_null': True},
            'cutoff_mark': {'required': False, 'allow_null': True},
            'previous_semester_percentage': {'required': False, 'allow_null': True},
            'cgpa': {'required': False, 'allow_null': True},
            'admission_year': {'required': False, 'allow_null': True},
            'backlog_count': {'required': False},
            'status': {'required': False},
        }

    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)

    def validate_name(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Student name is required and cannot be blank.")
        if len(stripped) > 100:
            raise serializers.ValidationError("Student name cannot exceed 100 characters.")
        return stripped

    def validate_register_number(self, value):
        stripped = value.strip().upper()
        if not stripped:
            raise serializers.ValidationError("Register number is required and cannot be blank.")
        if len(stripped) > 20:
            raise serializers.ValidationError("Register number cannot exceed 20 characters.")
        
        # Check uniqueness taking into account the instance if updating
        instance = getattr(self, 'instance', None)
        query = Student.objects.filter(register_number__iexact=stripped)
        if instance:
            query = query.exclude(pk=instance.pk)
        if query.exists():
            raise serializers.ValidationError("A student with this register number already exists.")
        return stripped

    def validate_email(self, value):
        email_clean = value.strip().lower()
        if not email_clean:
            raise serializers.ValidationError("Email is required.")
        
        instance = getattr(self, 'instance', None)
        query = Student.objects.filter(email__iexact=email_clean)
        if instance:
            query = query.exclude(pk=instance.pk)
        if query.exists():
            raise serializers.ValidationError("A student with this email address already exists.")
        return email_clean

    def validate_department(self, value):
        if value is None:
            if self.instance is None:
                raise serializers.ValidationError("Department is required.")
            raise serializers.ValidationError("Select a department before saving this student.")
        if not Department.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Selected department does not exist.")
        request = self.context.get('request')
        college = get_user_college(request.user) if request else None
        if college and value.college_id not in (None, college.id):
            raise serializers.ValidationError("Selected department does not belong to your institution.")
        return value

    def validate_gender(self, value):
        if value not in {'male', 'female'}:
            raise serializers.ValidationError("Gender is required.")
        return value

    def validate_cutoff_mark(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Cutoff mark cannot be negative.")
        return value

    def validate_previous_semester_percentage(self, value):
        if value is not None and not 0 <= value <= 100:
            raise serializers.ValidationError("Previous semester percentage must be between 0 and 100.")
        return value

    def validate_cgpa(self, value):
        if value is not None and not 0 <= value <= 10:
            raise serializers.ValidationError("CGPA must be between 0 and 10.")
        return value

    def validate_backlog_count(self, value):
        if value is None or int(value) < 0 or int(value) != value:
            raise serializers.ValidationError('Backlog count must be a non-negative whole number.')
        return int(value)

    def validate_year(self, value):
        try:
            year_val = int(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError("Year must be an integer between 1 and 4.")
        
        if year_val not in [1, 2, 3, 4]:
            raise serializers.ValidationError("Year must be 1, 2, 3, or 4.")
        return year_val

    def validate_phone(self, value):
        stripped = str(value).strip()
        if not stripped:
            raise serializers.ValidationError("Phone number is required.")
        
        # Validate 10-digit Indian mobile number: starts with 6, 7, 8, 9 followed by 9 digits
        pattern = r'^[6-9]\d{9}$'
        if not re.match(pattern, stripped):
            raise serializers.ValidationError(
                "Phone number must be a valid 10-digit Indian mobile number (e.g. 9876543210)."
            )
        return stripped
