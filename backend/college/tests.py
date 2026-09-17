from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import CollegeSettings, Department, UserAccess
from students.models import Student


class AuthenticationTests(TestCase):
	def setUp(self):
		self.client = APIClient()

	def test_private_students_api_requires_authentication(self):
		response = self.client.get('/api/students/')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_setup_hashes_password_and_returns_token(self):
		response = self.client.post('/api/setup/', {
			'college_name': 'Example Institution',
			'admin_name': 'Example Admin',
			'email': 'admin@example.com',
			'password': 'StrongPass123!',
			'confirm_password': 'StrongPass123!',
		}, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		user = User.objects.get(username='admin@example.com')
		self.assertNotEqual(user.password, 'StrongPass123!')
		self.assertTrue(user.check_password('StrongPass123!'))
		self.assertTrue(response.data.get('token'))

	def test_invalid_login_is_rejected(self):
		User.objects.create_user(username='admin@example.com', password='StrongPass123!')
		response = self.client.post('/api/login/', {'email': 'admin@example.com', 'password': 'wrong'}, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_department_api_returns_database_departments(self):
		user = User.objects.create_user(username='dept-admin@example.com', password='StrongPass123!')
		college = CollegeSettings.objects.create(college_name='Test Institution', admin_user=user)
		UserAccess.objects.create(user=user, college=college, role='admin', can_manage_departments=True)
		Department.objects.create(name='Database Department', code='DB', college=college)
		self.client.force_authenticate(user=user)
		response = self.client.get('/api/departments/')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 1)
		self.assertEqual(response.data['data'][0]['name'], 'Database Department')

	def test_user_without_department_permission_is_rejected(self):
		user = User.objects.create_user(username='limited@example.com', password='StrongPass123!')
		college = CollegeSettings.objects.create(college_name='Limited Institution', admin_user=None)
		UserAccess.objects.create(user=user, college=college, role='user', can_view_students=True)
		self.client.force_authenticate(user=user)
		response = self.client.post('/api/departments/', {'name': 'Blocked'}, format='json')
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_user_permission_denies_student_delete(self):
		user = User.objects.create_user(username='user@example.com', password='StrongPass123!')
		UserAccess.objects.create(user=user, can_view_students=True, can_add_students=True)
		department = Department.objects.create(name='Permission Test')
		student = Student.objects.create(name='Test User', register_number='PERM001', email='perm@example.com', gender='male', department=department, year=1, phone='9876543210')
		self.client.force_authenticate(user=user)
		response = self.client.delete(f'/api/students/{student.id}/')
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
