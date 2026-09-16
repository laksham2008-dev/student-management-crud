import re
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

# Indian 10-digit mobile number validator (starts with 6, 7, 8, or 9 followed by 9 digits)
phone_regex = RegexValidator(
    regex=r'^[6-9]\d{9}$',
    message="Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
)


class Student(models.Model):
    YEAR_CHOICES = (
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
    )

    name = models.CharField(
        max_length=100,
        blank=False,
        null=False,
        help_text="Full name of the student (max 100 characters)"
    )
    register_number = models.CharField(
        max_length=20,
        unique=True,
        blank=False,
        null=False,
        help_text="Unique register/roll number (max 20 characters)"
    )
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        help_text="Unique email address"
    )
    department = models.CharField(
        max_length=100,
        blank=False,
        null=False,
        help_text="Department name (max 100 characters, e.g. CSE, ECE, MECH)"
    )
    year = models.IntegerField(
        choices=YEAR_CHOICES,
        validators=[
            MinValueValidator(1, message="Year must be at least 1."),
            MaxValueValidator(4, message="Year must be at most 4.")
        ],
        blank=False,
        null=False,
        help_text="Current year of study (1, 2, 3, or 4)"
    )
    phone = models.CharField(
        max_length=15,
        validators=[phone_regex],
        blank=False,
        null=False,
        help_text="10-digit Indian mobile number"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the student record was created"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def clean(self):
        super().clean()
        if self.name:
            self.name = self.name.strip()
            if not self.name:
                raise ValidationError({'name': 'Name cannot be empty or only spaces.'})
        if self.register_number:
            self.register_number = self.register_number.strip().upper()
            if not self.register_number:
                raise ValidationError({'register_number': 'Register number cannot be empty.'})
        if self.department:
            self.department = self.department.strip()
            if not self.department:
                raise ValidationError({'department': 'Department cannot be empty.'})
        if self.phone:
            self.phone = self.phone.strip()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.register_number}) - {self.department}"
