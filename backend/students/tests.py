from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Student
from college.models import Department
from college.models import UserAccess
from django.contrib.auth.models import User


class StudentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='admin@example.com', password='StrongPass123!')
        UserAccess.objects.create(user=self.user, role='admin', can_view_students=True, can_add_students=True, can_edit_students=True, can_delete_students=True, can_manage_departments=True)
        self.client.force_authenticate(user=self.user)
        self.cse = Department.objects.create(name="CSE")
        self.ece = Department.objects.create(name="ECE")
        self.mech = Department.objects.create(name="MECH")
        self.valid_student_data = {
            "name": "Laksha",
            "register_number": "STU001",
            "email": "laksha@example.com",
            "gender": "male",
            "department": self.cse.id,
            "year": 2,
            "phone": "9876543210"
        }
        self.student = Student.objects.create(
            name="John Doe",
            register_number="STU002",
            email="john@example.com",
            department=self.ece,
            gender="male",
            year=3,
            phone="9876543211"
        )
        self.list_url = reverse('student-list')
        self.detail_url = reverse('student-detail', kwargs={'pk': self.student.id})

    def test_create_valid_student(self):
        """Test Case: Create valid student (POST) -> 201 Created"""
        response = self.client.post(self.list_url, self.valid_student_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('success'))
        self.assertEqual(response.data['data']['name'], "Laksha")
        self.assertEqual(response.data['data']['register_number'], "STU001")
        self.assertEqual(Student.objects.filter(register_number="STU001").count(), 1)

    def test_create_missing_name(self):
        """Test Case: Create missing name (POST) -> 400 Bad Request"""
        invalid_data = self.valid_student_data.copy()
        invalid_data['name'] = ""
        response = self.client.post(self.list_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))

    def test_create_duplicate_register_number(self):
        """Test Case: Create duplicate register number (POST) -> 400 Bad Request"""
        invalid_data = self.valid_student_data.copy()
        invalid_data['register_number'] = self.student.register_number  # "STU002"
        response = self.client.post(self.list_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))

    def test_create_duplicate_email(self):
        """Test Case: Create duplicate email (POST) -> 400 Bad Request"""
        invalid_data = self.valid_student_data.copy()
        invalid_data['email'] = self.student.email  # "john@example.com"
        response = self.client.post(self.list_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))

    def test_create_invalid_year(self):
        """Test Case: Create invalid year (POST) -> 400 Bad Request"""
        invalid_data = self.valid_student_data.copy()
        invalid_data['year'] = 5
        response = self.client.post(self.list_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_phone(self):
        """Test Case: Create invalid phone format (POST) -> 400 Bad Request"""
        invalid_data = self.valid_student_data.copy()
        invalid_data['phone'] = "12345"
        response = self.client.post(self.list_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_read_all_students(self):
        """Test Case: Read all students (GET) -> 200 OK"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

    def test_read_valid_student(self):
        """Test Case: Read valid student (GET) -> 200 OK"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['register_number'], self.student.register_number)

    def test_read_invalid_id(self):
        """Test Case: Read invalid ID (GET) -> 404 Not Found"""
        invalid_url = reverse('student-detail', kwargs={'pk': 99999})
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_valid_student(self):
        """Test Case: Update valid student (PUT) -> 200 OK"""
        update_data = {
            "name": "John Updated",
            "register_number": "STU002",
            "email": "john_updated@example.com",
            "gender": "male",
            "department": self.ece.id,
            "year": 4,
            "phone": "9876543211"
        }
        response = self.client.put(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['name'], "John Updated")
        self.student.refresh_from_db()
        self.assertEqual(self.student.name, "John Updated")

    def test_partial_update_valid_student(self):
        """Test Case: Partial update student (PATCH) -> 200 OK"""
        patch_data = {"phone": "9999999999"}
        response = self.client.patch(self.detail_url, patch_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.phone, "9999999999")

    def test_update_invalid_id(self):
        """Test Case: Update invalid ID (PUT) -> 404 Not Found"""
        invalid_url = reverse('student-detail', kwargs={'pk': 99999})
        response = self.client.put(invalid_url, self.valid_student_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_valid_student(self):
        """Test Case: Delete valid student (DELETE) -> 204 No Content"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Student.objects.filter(id=self.student.id).count(), 0)

    def test_delete_invalid_id(self):
        """Test Case: Delete invalid ID (DELETE) -> 404 Not Found"""
        invalid_url = reverse('student-detail', kwargs={'pk': 99999})
        response = self.client.delete(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_search_student(self):
        """Test Case: Search students by query (GET ?search=)"""
        Student.objects.create(
            name="Alice Smith",
            register_number="STU003",
            email="alice@example.com",
            department=self.mech,
            gender="female",
            year=1,
            phone="9876543212"
        )
        # Search by name
        response = self.client.get(f"{self.list_url}?search=Alice")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Alice Smith")

        # Search by department
        response = self.client.get(f"{self.list_url}?search=MECH")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
