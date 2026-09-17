from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from college.models import CollegeSettings, Department

# Indian 10-digit mobile number validator (starts with 6, 7, 8, or 9 followed by 9 digits)
phone_regex = RegexValidator(
    regex=r'^[6-9]\d{9}$',
    message="Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
)


class Student(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
    )
    YEAR_CHOICES = (
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('graduated', 'Graduated'),
        ('left_college', 'Left College'),
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
    legacy_department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Preserved department text from the original schema"
    )
    college = models.ForeignKey(CollegeSettings, on_delete=models.CASCADE, null=True, blank=True, related_name='students')
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='students',
        blank=True,
        null=True,
        help_text="Department assigned to the student"
    )
    gender = models.CharField(max_length=30, choices=GENDER_CHOICES, blank=True, null=True)
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
    cutoff_mark = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True,
    )
    previous_semester_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True,
        null=True,
    )
    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        blank=True,
        null=True,
    )
    admission_year = models.PositiveIntegerField(blank=True, null=True)
    backlog_count = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the student record was created"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def clean(self):
        super().clean()
        if self.gender not in {None, 'male', 'female'}:
            self.gender = None
        if self.name:
            self.name = self.name.strip()
            if not self.name:
                raise ValidationError({'name': 'Name cannot be empty or only spaces.'})
        if self.register_number:
            self.register_number = self.register_number.strip().upper()
            if not self.register_number:
                raise ValidationError({'register_number': 'Register number cannot be empty.'})
        if self.phone:
            self.phone = self.phone.strip()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.register_number}) - {self.department or 'Unassigned'}"
