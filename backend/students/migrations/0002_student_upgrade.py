from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


def preserve_matching_departments(apps, schema_editor):
    Student = apps.get_model('students', 'Student')
    Department = apps.get_model('college', 'Department')
    departments = {department.name.strip().casefold(): department.pk for department in Department.objects.all()}
    for student in Student.objects.exclude(legacy_department__isnull=True).exclude(legacy_department=''):
        department_id = departments.get(student.legacy_department.strip().casefold())
        if department_id is not None:
            student.department_id = department_id
            student.save(update_fields=['department'])


class Migration(migrations.Migration):
    dependencies = [
        ('students', '0001_initial'),
        ('college', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='student',
            old_name='department',
            new_name='legacy_department',
        ),
        migrations.AddField(
            model_name='student',
            name='department',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='students',
                to='college.department',
            ),
        ),
        migrations.AddField(
            model_name='student',
            name='gender',
            field=models.CharField(blank=True, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other'), ('prefer_not_to_say', 'Prefer not to say')], max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='student',
            name='cutoff_mark',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True, validators=[django.core.validators.MinValueValidator(0)]),
        ),
        migrations.AddField(
            model_name='student',
            name='previous_semester_percentage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)]),
        ),
        migrations.AddField(
            model_name='student',
            name='cgpa',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(10)]),
        ),
        migrations.RunPython(preserve_matching_departments, migrations.RunPython.noop),
    ]
