import re
from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id',
            'name',
            'register_number',
            'email',
            'department',
            'year',
            'phone',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

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
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Department is required and cannot be blank.")
        if len(stripped) > 100:
            raise serializers.ValidationError("Department cannot exceed 100 characters.")
        return stripped

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
