# Student Management System - REST API Documentation

This document provides complete documentation for the REST API developed for the **Student Management System** using Django REST Framework and SQLite.

---

## 1. Base URL
```
http://127.0.0.1:8000/api/students/
```

- **Data Format**: `application/json`
- **Authentication**: None (Public CRUD for college demonstration)
- **CORS Enabled**: Yes (`http://localhost:5173`, `http://127.0.0.1:5173`)

---

## 2. Student Data Model Schema

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Auto-increment, Primary Key | Unique student database identifier |
| `name` | String | Max 100 chars, Required | Full name of student |
| `register_number` | String | Max 20 chars, Unique, Required | College roll/registration number (e.g., `STU001`) |
| `email` | String (Email) | Unique, Required | Valid email address |
| `department` | String | Max 100 chars, Required | Branch/department (e.g., `CSE`, `ECE`) |
| `year` | Integer | Choices: `1, 2, 3, 4`, Required | Current year of study |
| `phone` | String | 10-digit Indian format (`^[6-9]\d{9}$`), Required | Contact mobile number |
| `created_at` | DateTime | Auto-generated timestamp | Timestamp when record was created |

---

## 3. API Endpoints

### 3.1. Create a New Student
- **Method**: `POST`
- **URL**: `/api/students/`
- **Success Status**: `201 Created`

#### Request Headers:
```http
Content-Type: application/json
Accept: application/json
```

#### Request Body:
```json
{
  "name": "Laksha",
  "register_number": "STU001",
  "email": "laksha@example.com",
  "department": "CSE",
  "year": 2,
  "phone": "9876543210"
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Student added successfully.",
  "data": {
    "id": 1,
    "name": "Laksha",
    "register_number": "STU001",
    "email": "laksha@example.com",
    "department": "CSE",
    "year": 2,
    "phone": "9876543210",
    "created_at": "2026-09-16T09:30:00.000000Z"
  }
}
```

#### Validation Error Response (`400 Bad Request`):
```json
{
  "success": false,
  "status_code": 400,
  "error": "Validation Error",
  "details": {
    "register_number": [
      "A student with this register number already exists."
    ]
  }
}
```

---

### 3.2. Retrieve All Students
- **Method**: `GET`
- **URL**: `/api/students/`
- **Optional Query Parameter**: `?search=<query>` (filters across name, reg no, department, and email)
- **Success Status**: `200 OK`

#### Success Response (`200 OK`):
```json
[
  {
    "id": 1,
    "name": "Laksha",
    "register_number": "STU001",
    "email": "laksha@example.com",
    "department": "CSE",
    "year": 2,
    "phone": "9876543210",
    "created_at": "2026-09-16T09:30:00.000000Z"
  }
]
```

---

### 3.3. Retrieve a Single Student
- **Method**: `GET`
- **URL**: `/api/students/{id}/`
- **Success Status**: `200 OK`

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laksha",
    "register_number": "STU001",
    "email": "laksha@example.com",
    "department": "CSE",
    "year": 2,
    "phone": "9876543210",
    "created_at": "2026-09-16T09:30:00.000000Z"
  }
}
```

#### Error Response (`404 Not Found`):
```json
{
  "success": false,
  "status_code": 404,
  "error": "Not Found",
  "detail": "The requested student resource was not found."
}
```

---

### 3.4. Update an Existing Student (Full Update)
- **Method**: `PUT`
- **URL**: `/api/students/{id}/`
- **Success Status**: `200 OK`

#### Request Body:
```json
{
  "name": "Laksha M",
  "register_number": "STU001",
  "email": "laksha@example.com",
  "department": "CSE",
  "year": 2,
  "phone": "9999999999"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Student updated successfully.",
  "data": {
    "id": 1,
    "name": "Laksha M",
    "register_number": "STU001",
    "email": "laksha@example.com",
    "department": "CSE",
    "year": 2,
    "phone": "9999999999",
    "created_at": "2026-09-16T09:30:00.000000Z"
  }
}
```

---

### 3.5. Partially Update a Student
- **Method**: `PATCH`
- **URL**: `/api/students/{id}/`
- **Success Status**: `200 OK`

#### Request Body:
```json
{
  "phone": "9888888888"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Student updated successfully.",
  "data": {
    "id": 1,
    "name": "Laksha M",
    "register_number": "STU001",
    "email": "laksha@example.com",
    "department": "CSE",
    "year": 2,
    "phone": "9888888888",
    "created_at": "2026-09-16T09:30:00.000000Z"
  }
}
```

---

### 3.6. Delete a Student
- **Method**: `DELETE`
- **URL**: `/api/students/{id}/`
- **Success Status**: `204 No Content`

#### Error Response for Non-Existent ID (`404 Not Found`):
```json
{
  "success": false,
  "status_code": 404,
  "error": "Not Found",
  "detail": "The requested student resource was not found."
}
```

---

## 4. API Test Cases Summary

| # | Test Case Description | HTTP Method | Endpoint | Expected HTTP Status | Expected Result |
|---|:---|:---:|:---|:---:|:---|
| 1 | Create valid student | `POST` | `/api/students/` | `201 Created` | Student created with auto-generated ID |
| 2 | Create missing name | `POST` | `/api/students/` | `400 Bad Request` | Validation error (`name` is required) |
| 3 | Create duplicate register number | `POST` | `/api/students/` | `400 Bad Request` | Validation error (Duplicate register number) |
| 4 | Create duplicate email | `POST` | `/api/students/` | `400 Bad Request` | Validation error (Duplicate email) |
| 5 | Create invalid year (e.g. 5) | `POST` | `/api/students/` | `400 Bad Request` | Validation error (Year must be 1, 2, 3, or 4) |
| 6 | Create invalid phone format | `POST` | `/api/students/` | `400 Bad Request` | Validation error (10-digit Indian phone regex) |
| 7 | Read all students | `GET` | `/api/students/` | `200 OK` | Array of student objects returned |
| 8 | Read valid student | `GET` | `/api/students/1/` | `200 OK` | Single student object returned |
| 9 | Read invalid ID | `GET` | `/api/students/9999/` | `404 Not Found` | Clean JSON 404 error response |
| 10 | Update valid student | `PUT` | `/api/students/1/` | `200 OK` | Student record updated and returned |
| 11 | Partial update student | `PATCH` | `/api/students/1/` | `200 OK` | Specified field updated |
| 12 | Update invalid ID | `PUT` | `/api/students/9999/` | `404 Not Found` | Clean JSON 404 error response |
| 13 | Delete valid student | `DELETE` | `/api/students/1/` | `204 No Content` | Student removed from database |
| 14 | Delete invalid ID | `DELETE` | `/api/students/9999/` | `404 Not Found` | Clean JSON 404 error response |
| 15 | Search students | `GET` | `/api/students/?search=CSE` | `200 OK` | Filtered list matching query |

---

## 5. Postman Testing Guide

### Option 1: Import Pre-configured Collection
Import the ready-to-use Postman collection located at:
```
documentation/Student_Management_API.postman_collection.json
```

### Option 2: Manual Postman Setup
1. **Start Django Backend**:
   ```bash
   cd backend
   python manage.py runserver
   ```
2. In Postman, create a new collection called **Student Management System**.
3. Create the requests matching the table above.
4. Set Header: `Content-Type: application/json`.
5. Run the requests in sequence: `POST` -> `GET` -> `PUT` -> `DELETE`.
