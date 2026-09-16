# Student Management System

A college-level full-stack **CRUD (Create, Read, Update, Delete) Web Application** designed for managing student records. Built using a decoupled architecture with **Django REST Framework** powering the backend API, **React (Vite)** on the frontend, and **SQLite** as the database.

---

## 1. Project Overview

The **Student Management System** is a responsive web application that streamlines the recording, retrieval, modification, and deletion of college student profiles. It demonstrates core software engineering principles including RESTful API design, database constraints, double-layer validation (client & server), dynamic search filtering, responsive UI design, and automated testing readiness.

---

## 2. Problem Statement

Educational institutions handle large volumes of student records spanning multiple departments and academic years. Manual tracking or disparate spreadsheet logs frequently lead to duplicate entries, invalid contact details, and slow lookups. This system provides a centralized, validated, and interactive dashboard to manage student records efficiently without data duplication or manual errors.

---

## 3. Objectives

- Implement complete **CRUD operations** via RESTful architecture.
- Ensure strict **client-side and server-side data validation**.
- Enforce database integrity with unique constraints and format regex.
- Provide a clean, modern, and **responsive user experience** across mobile, tablet, and desktop devices.
- Deliver clear **API documentation** and **Postman test suites** for viva and project evaluation.

---

## 4. Key Features

- **Add Student**: Intuitive form to register new students with instant client-side validation.
- **View Students**: Clean, responsive table displaying all enrolled student records directly from SQLite.
- **Edit Student**: Seamless inline editing mode that pre-populates the form with existing student details.
- **Delete Student with Confirmation**: Safe deletion workflow featuring an accessible confirmation modal.
- **Dynamic Search / Filter**: Real-time client-side search filtering by student name, roll/register number, department, or email.
- **Client & Server Validation**: Double-layer validation preventing empty fields, duplicate roll numbers/emails, invalid years, or non-10-digit phone numbers.
- **REST API**: Standardized JSON endpoints adhering to HTTP status codes (`200`, `201`, `204`, `400`, `404`, `500`).
- **Connection Health & Loading States**: Clear user feedback for loading, empty states, and server unreachable alerts.

---

## 5. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | JavaScript, JSX, Vanilla CSS, Lucide Icons |
| **Backend** | Python 3.14 + Django 5.2 | Django REST Framework (DRF), `django-cors-headers` |
| **Database** | SQLite3 | Default lightweight relational database (`db.sqlite3`) |
| **API Protocol** | REST API | JSON over HTTP (`Fetch API`) |
| **API Testing** | Postman & Django TestCase | Automated unit tests and collection |
| **Version Control** | Git & GitHub | Modular commit history |

---

## 6. System Architecture

```
User (Browser)
      │
      ▼
React Frontend (Vite)  ──[ HTTP / JSON Requests ]──►  Django REST Framework
      │                                                        │
      │                                                        ▼
      │                                                Django ORM (Models)
      │                                                        │
      ▼                                                        ▼
Rendered UI Components ◄──[ JSON API Responses ]──────  SQLite Database (db.sqlite3)
```

---

## 7. Project Structure

```
Student-Management-CRUD/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py          # CORS, DRF, Apps configuration
│   │   ├── urls.py              # Main URL router
│   │   └── wsgi.py
│   ├── students/
│   │   ├── migrations/          # Database migrations
│   │   │   ├── 0001_initial.py
│   │   │   └── __init__.py
│   │   ├── __init__.py
│   │   ├── admin.py             # Django Admin registration
│   │   ├── apps.py
│   │   ├── exceptions.py        # Custom API exception handler
│   │   ├── models.py            # Student model & DB constraints
│   │   ├── serializers.py       # DRF StudentSerializer & validation
│   │   ├── tests.py             # 15 automated API unit tests
│   │   ├── urls.py              # Student API endpoints
│   │   └── views.py             # StudentViewSet CRUD handlers
│   ├── db.sqlite3               # SQLite database file
│   ├── manage.py
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx # Delete confirmation modal
│   │   │   ├── SearchBar.jsx     # Live search bar component
│   │   │   ├── StudentForm.jsx   # Add/Edit form with validation
│   │   │   ├── StudentList.jsx   # Responsive student records table
│   │   │   └── Toast.jsx         # Notification alert popup
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service client
│   │   ├── App.jsx               # Main application component & state
│   │   ├── App.css               # Component & dashboard styling
│   │   ├── index.css             # Design tokens, variables, typography
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── documentation/
│   ├── API_DOCUMENTATION.md     # Detailed API specification & test matrix
│   └── Student_Management_API.postman_collection.json # Ready-to-import Postman collection
│
├── .gitignore
└── README.md
```

---

## 8. Prerequisites

Ensure you have the following installed on your system:
- **Python**: Version 3.10+ (Tested on Python 3.14)
- **Node.js**: Version 18+ (Tested on Node.js 24)
- **Git**
- **Postman** (for API testing)

---

## 9. Backend Setup Instructions

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment** (recommended):
   - **Windows (Command Prompt / PowerShell)**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Run backend automated tests** (optional verification):
   ```bash
   python manage.py test students
   ```

6. **Start the Django development server**:
   ```bash
   python manage.py runserver
   ```
   The backend API will run at `http://127.0.0.1:8000/api/students/`.

---

## 10. Frontend Setup Instructions

1. **Open a new terminal and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the React Vite development server**:
   ```bash
   npm run dev
   ```
   The application dashboard will be available at `http://localhost:5173/` or `http://127.0.0.1:5173/`.

---

## 11. REST API Endpoints

| HTTP Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students/` | Retrieve all student records | `200 OK` |
| `GET` | `/api/students/?search=<query>` | Filter students by name, reg no, department, email | `200 OK` |
| `GET` | `/api/students/{id}/` | Retrieve single student by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/students/` | Create a new student record | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/students/{id}/` | Full update of student record | `200 OK` / `400 Bad Request` / `404` |
| `PATCH` | `/api/students/{id}/` | Partial update of student fields | `200 OK` / `400 Bad Request` / `404` |
| `DELETE` | `/api/students/{id}/` | Delete a student record | `204 No Content` / `404 Not Found` |

---

## 12. Validation Rules Summary

| Field | Rule | Error Message |
| :--- | :--- | :--- |
| **Name** | Required, Max 100 chars, Non-empty string | "Student name is required and cannot be blank." |
| **Register Number** | Required, Max 20 chars, Unique | "A student with this register number already exists." |
| **Email** | Required, Unique, Valid email format | "A student with this email address already exists." |
| **Department** | Required, Max 100 chars | "Department is required and cannot be blank." |
| **Year** | Required, Value must be `1`, `2`, `3`, or `4` | "Year must be 1, 2, 3, or 4." |
| **Phone** | Required, 10-digit Indian mobile format (`^[6-9]\d{9}$`) | "Phone number must be a valid 10-digit Indian mobile number." |

---

## 13. API Testing with Postman

Import `documentation/Student_Management_API.postman_collection.json` into Postman to run pre-configured test requests:

1. **Create Student (`POST`)**:
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
2. **Read All Students (`GET`)**: `http://127.0.0.1:8000/api/students/`
3. **Update Student (`PUT`)**: `http://127.0.0.1:8000/api/students/1/`
4. **Delete Student (`DELETE`)**: `http://127.0.0.1:8000/api/students/1/`

---

## 14. Future Enhancements

- **User Authentication & Roles**: JWT-based login for Admin, Faculty, and Students.
- **Data Export**: Export student lists to CSV / PDF formats.
- **Pagination**: Server-side pagination for handling 10,000+ student records.
- **PostgreSQL Database**: Deployment readiness with PostgreSQL on AWS / Render.
- **Student Profile Picture Upload**: Integration with Cloudinary or AWS S3 for profile photos.

---

## 15. Connecting to GitHub Repository

To link this local project to your personal GitHub repository, execute the following commands in the root directory:

```bash
# 1. Add your GitHub remote repository URL
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/Student-Management-CRUD.git

# 2. Rename default branch to main
git branch -M main

# 3. Push all commits to GitHub
git push -u origin main
```
*(Replace `<YOUR_GITHUB_USERNAME>` with your actual GitHub username)*
