# Student Management System - REST API Documentation

This document provides complete documentation for the REST API developed for the **Student Management System** using Django REST Framework and SQLite.

---

## 1. Base URL
```
http://127.0.0.1:8000/api/
```

- **Data Format**: `application/json`
- **Authentication**: Required for students, departments, users and settings. Send the DRF token as `Authorization: Token <token>`. Only `GET/POST /api/setup/` and `POST /api/login/` are public.
- **CORS Enabled**: Yes (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:5174`, `http://127.0.0.1:5174`, `http://localhost:3000`, `http://127.0.0.1:3000`)

### 1.1. Authentication / Token Flow

1. `GET /api/setup/` → `{ "configured": false }` when no institution has been created yet.
2. `POST /api/setup/` (first run only) creates the institution profile plus the administrator account and returns a token.
3. `POST /api/login/` returns a token for an existing account (the institution administrator or a user created under it).
4. Send `Authorization: Token <token>` on every private request (`/api/students/`, `/api/departments/`, `/api/users/`, `/api/settings/`).
5. `POST /api/logout/` deletes the token of the authenticated user.

```http
POST /api/login/
Content-Type: application/json

{ "email": "admin@example.com", "password": "YourPassword123" }
```

```json
{
  "token": "9c1f0a7d2b4e4f8a8f0c1d2e3f4a5b6c7d8e9f0a",
  "data": { "id": 1, "college_name": "Example Institution", "admin_email": "admin@example.com" }
}
```

| Scenario | Status |
| :--- | :--- |
| Missing or invalid token on a private endpoint | `401 Unauthorized` |
| Wrong email/password on `POST /api/login/` | `401 Unauthorized` |
| `POST /api/setup/` when the institution is already configured | `409 Conflict` |
| Authenticated but not allowed by role/permission flags | `403 Forbidden` |
| Method not exposed (e.g. `PUT /api/users/{id}/`) | `405 Method Not Allowed` |

---

## 2. Student Data Model Schema

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Auto-increment, Primary Key | Unique student database identifier |
| `name` | String | Max 100 chars, Required | Full name of student |
| `register_number` | String | Max 20 chars, Unique, Required | College roll/registration number (e.g., `STU001`) |
| `email` | String (Email) | Unique, Required | Valid email address |
| `department` | Integer (foreign key) | **Required** | Primary key of an existing `Department` — fetch the list from `GET /api/departments/` and send one of the returned `id` values |
| `department_name` | String | Read-only | Department name resolved by the API |
| `college` | Integer (foreign key) | Set automatically | Institution of the student, taken from the authenticated user |
| `gender` | String | Choices: `male`, `female`, Required | Gender of the student |
| `year` | Integer | Choices: `1, 2, 3, 4`, Required | Current year of study |
| `phone` | String | 10-digit Indian format (`^[6-9]\d{9}$`), Required | Contact mobile number |
| `cutoff_mark` | Decimal | Optional, `>= 0` | Cutoff mark |
| `previous_semester_percentage` | Decimal | Optional, `0`–`100` | Previous semester percentage |
| `cgpa` | Decimal | Optional, `0`–`10` | CGPA |
| `admission_year` | Integer | Optional | Year of admission |
| `backlog_count` | Integer | Optional, `>= 0`, default `0` | Number of backlogs |
| `status` | String | Choices: `active`, `graduated`, `left_college`, default `active` | Current student status |
| `created_at` / `updated_at` | DateTime | Auto-generated timestamps | Record creation / last update timestamps |

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
Authorization: Token <your-token>
```

#### Request Body:
```json
{
  "name": "Laksha",
  "register_number": "STU001",
  "email": "laksha@example.com",
  "department": 3,
  "year": 2,
  "phone": "9876543210"
}
```

> `department` is the **numeric primary key** of a department, not its name. Call `GET /api/departments/` first and reuse one of the returned `id` values (for example `3` for `CSE`). Sending a name such as `"CSE"` returns `400 Bad Request`.

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
    "department": 3,
    "department_name": "CSE",
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
      "Student with this register number already exists."
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
    "department": 3,
    "department_name": "CSE",
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
    "department": 3,
    "department_name": "CSE",
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
  "department": 3,
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
    "department": 3,
    "department_name": "CSE",
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
    "department": 3,
    "department_name": "CSE",
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

---

### 3.7. Department Endpoints

Departments are the lookup list referenced by the student `department` field.

#### List Departments
- **Method**: `GET`
- **URL**: `/api/departments/`
- **Success Status**: `200 OK`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 3,
      "name": "CSE",
      "code": "CSE",
      "student_count": 12,
      "male_count": 7,
      "female_count": 5,
      "created_at": "2026-09-16T09:30:00.000000Z"
    }
  ]
}
```

#### Retrieve a Single Department
- **Method**: `GET`
- **URL**: `/api/departments/{id}/`
- **Success Status**: `200 OK` / `404 Not Found`

#### Create a Department
- **Method**: `POST`
- **URL**: `/api/departments/`
- **Success Status**: `201 Created`
- **Required permission**: `can_manage_departments`

```json
{ "name": "Information Technology", "code": "IT" }
```

```json
{
  "success": true,
  "message": "Department created successfully.",
  "data": { "id": 9, "name": "Information Technology", "code": "IT", "student_count": 0, "male_count": 0, "female_count": 0, "created_at": "2026-09-17T10:00:00.000000Z" }
}
```

#### Update a Department (PUT / PATCH)
- **Method**: `PUT` (full update) or `PATCH` (partial update)
- **URL**: `/api/departments/{id}/`
- **Success Status**: `200 OK` / `400 Bad Request` / `404 Not Found`
- **Required permission**: `can_manage_departments`

```json
{ "name": "Computer Science and Engineering", "code": "CSE" }
```

```json
{
  "success": true,
  "message": "Department updated successfully.",
  "data": { "id": 3, "name": "Computer Science and Engineering", "code": "CSE", "student_count": 12, "male_count": 7, "female_count": 5, "created_at": "2026-09-16T09:30:00.000000Z" }
}
```

Department names are unique (case-insensitive), so renaming to an existing name returns `400 Bad Request`:

```json
{
  "success": false,
  "status_code": 400,
  "error": "Validation Error",
  "details": { "name": ["Department with this name already exists."] }
}
```

#### Delete a Department
- **Method**: `DELETE`
- **URL**: `/api/departments/{id}/`
- **Success Status**: `200 OK`

A department that still has students assigned cannot be deleted (`400 Bad Request`):

```json
{
  "success": false,
  "message": "Cannot delete 'CSE' because students are currently assigned to it."
}
```

---

### 3.8. Authentication, Users and Institution Settings

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/setup/` | Public | `{ "configured": true/false }` — whether the institution and its administrator exist |
| `POST` | `/api/setup/` | Public | Creates the institution and its administrator (first run only) and returns a token. `409 Conflict` if already configured |
| `POST` | `/api/login/` | Public | Returns a token for an existing account. `401 Unauthorized` for bad credentials |
| `POST` | `/api/logout/` | Token | Deletes the token of the authenticated user |
| `GET` | `/api/settings/` | Token | Returns the institution settings (`configured: false` when unset) |
| `POST` | `/api/settings/` | Admin | Creates or updates the institution settings |
| `PATCH` | `/api/settings/` | Admin | Updates `college_name` and the administrator email |
| `GET` | `/api/users/` | Token | Lists user access profiles (a non-admin only sees their own) |
| `POST` | `/api/users/` | Admin | Creates a user; a valid email and a password of at least 8 characters are required |
| `GET` | `/api/users/{id}/` | Token | Retrieves a single user access profile |
| `PATCH` | `/api/users/{id}/` | Admin | Updates `role` and the `can_*` permission flags only |

`POST /api/setup/` request body:

```json
{
  "college_name": "Example Institution",
  "admin_name": "Example Admin",
  "email": "admin@example.com",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!"
}
```

`POST /api/users/` request body:

```json
{ "email": "staff@example.com", "password": "TemporaryPass123" }
```

`PATCH /api/users/{id}/` request body — only `role` and the five `can_*` flags are accepted, and invalid values are rejected with `400 Bad Request` instead of being stored:

```json
{ "role": "user", "can_add_students": true, "can_manage_departments": false }
```

```json
{
  "success": false,
  "status_code": 400,
  "error": "Validation Error",
  "details": { "role": ["\"owner\" is not a valid choice."] }
}
```

> `PUT` and `DELETE` are not exposed for `/api/users/{id}/`, and `PUT`/`PATCH` are only exposed for departments.

---

## 4. API Test Cases Summary

Every private request in the table below must send the header `Authorization: Token <token>`, where the token is obtained from `POST /api/login/` (or `POST /api/setup/` on first run).

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
| 16 | Private endpoint without token | `GET` | `/api/students/` | `401 Unauthorized` | Authentication is required |
| 17 | Login with valid credentials | `POST` | `/api/login/` | `200 OK` | DRF token returned |
| 18 | Login with wrong password | `POST` | `/api/login/` | `401 Unauthorized` | Invalid email or password |
| 19 | Setup when already configured | `POST` | `/api/setup/` | `409 Conflict` | Institution setup is already complete |
| 20 | List departments | `GET` | `/api/departments/` | `200 OK` | Departments returned with student counts |
| 21 | Read single department | `GET` | `/api/departments/3/` | `200 OK` | Single department returned |
| 22 | Create department | `POST` | `/api/departments/` | `201 Created` | Department created |
| 23 | Update department | `PUT` | `/api/departments/3/` | `200 OK` | Department name/code updated |
| 24 | Update department to a duplicate name | `PUT` | `/api/departments/3/` | `400 Bad Request` | Duplicate name rejected |
| 25 | Partial update department | `PATCH` | `/api/departments/3/` | `200 OK` | Only the supplied field is changed |
| 26 | Delete a department with students | `DELETE` | `/api/departments/3/` | `400 Bad Request` | Department cannot be deleted |
| 27 | Update user with an invalid role | `PATCH` | `/api/users/2/` | `400 Bad Request` | Invalid role rejected, nothing stored |

---

## 5. Postman Testing Guide

### Option 1: Import Pre-configured Collection
Import the ready-to-use Postman collection located at:
```
documentation/Student_Management_API.postman_collection.json
```
The collection defines a `token` variable that every private request sends as `Authorization: Token {{token}}`. Run the **Setup status** and **Login** requests first — the Login request stores the returned token in the `token` variable automatically.

### Option 2: Manual Postman Setup
1. **Start Django Backend**:
   ```bash
   cd backend
   python manage.py runserver
   ```
2. In Postman, create a new collection called **Student Management System** and add a collection variable `token` (leave it empty at first).
3. Create the requests matching the table above.
4. Set the header `Content-Type: application/json`, and add `Authorization: Token {{token}}` to every private request.
5. Run `GET /api/setup/`, then `POST /api/login/` to obtain a token and store it in the `token` variable.
6. Run `GET /api/departments/` and use one of the returned `id` values as the `department` field of a student.
7. Run the student requests in sequence: `POST` -> `GET` -> `PUT` -> `DELETE`.
