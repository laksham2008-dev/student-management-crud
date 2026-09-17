from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('students', '0002_student_upgrade'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='legacy_department',
            field=models.CharField(blank=True, help_text='Preserved department text from the original schema', max_length=100, null=True),
        ),
    ]
