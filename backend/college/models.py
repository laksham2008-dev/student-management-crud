from django.db import models


class CollegeSettings(models.Model):
    """
    Singleton model storing college/institution configuration.
    Only one record should exist.
    """
    college_name = models.CharField(
        max_length=200,
        blank=False,
        null=False,
        help_text="Name of the college or institution"
    )
    admin_user = models.OneToOneField(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='college_settings'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "College Settings"
        verbose_name_plural = "College Settings"

    def __str__(self):
        return self.college_name

    def clean(self):
        from django.core.exceptions import ValidationError
        self.college_name = self.college_name.strip()
        if not self.college_name:
            raise ValidationError({'college_name': 'College name cannot be empty.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class UserAccess(models.Model):
    ROLE_CHOICES = (('admin', 'Admin'), ('user', 'User'))
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='access_profile')
    college = models.ForeignKey('CollegeSettings', on_delete=models.CASCADE, null=True, blank=True, related_name='user_access')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    can_view_students = models.BooleanField(default=True)
    can_add_students = models.BooleanField(default=False)
    can_edit_students = models.BooleanField(default=False)
    can_delete_students = models.BooleanField(default=False)
    can_manage_departments = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.username} ({self.role})'


class Department(models.Model):
    """
    Academic department within the college.
    Department names must be unique.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        blank=False,
        null=False,
        help_text="Department name (must be unique)"
    )
    college = models.ForeignKey(CollegeSettings, on_delete=models.CASCADE, null=True, blank=True, related_name='departments')
    code = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return self.name

    def clean(self):
        from django.core.exceptions import ValidationError
        self.name = self.name.strip()
        if not self.name:
            raise ValidationError({'name': 'Department name cannot be empty.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
