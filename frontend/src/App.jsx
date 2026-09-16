import React, { useState, useEffect, useMemo, useCallback } from 'react';
import studentApi from './services/api';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import SearchBar from './components/SearchBar';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';
import { GraduationCap, Users, Sparkles, BookOpen, Layers } from 'lucide-react';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [formServerErrors, setFormServerErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper to show toast messages
  const showToast = (message, type = 'success', title = '') => {
    setToast({ message, type, title });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Fetch all students from the backend API
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setServerError(null);
    try {
      const data = await studentApi.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error('Fetch students failed:', err);
      setServerError(
        'Unable to connect to the server. Please make sure the backend is running.'
      );
      showToast(
        'Unable to connect to the server. Please make sure the backend is running.',
        'error',
        'Connection Error'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Dynamic filter for search bar (Client-Side real-time search across Name, Reg No, Department, Email)
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) {
      return students;
    }
    const query = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const name = (student.name || '').toLowerCase();
      const reg = (student.register_number || '').toLowerCase();
      const dept = (student.department || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      return (
        name.includes(query) ||
        reg.includes(query) ||
        dept.includes(query) ||
        email.includes(query)
      );
    });
  }, [students, searchTerm]);

  // Handle Form Submission (Add or Update)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormServerErrors({});

    try {
      if (editingStudent && editingStudent.id) {
        // Update existing student
        await studentApi.updateStudent(editingStudent.id, formData);
        showToast('Student updated successfully.', 'success');
        setEditingStudent(null);
      } else {
        // Create new student
        await studentApi.createStudent(formData);
        showToast('Student added successfully.', 'success');
      }
      await fetchStudents();
    } catch (err) {
      console.error('Save student failed:', err);
      if (err.data && err.data.details && typeof err.data.details === 'object') {
        setFormServerErrors(err.data.details);
        showToast(
          err.message || 'Please fix the errors in the form.',
          'error',
          'Validation Error'
        );
      } else {
        showToast(
          err.message || 'An error occurred while saving the student.',
          'error',
          'Error'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Action
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormServerErrors({});
    // Scroll smoothly to form
    const formElement = document.getElementById('student-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingStudent(null);
    setFormServerErrors({});
  };

  // Handle Delete Click (Open Modal)
  const handleDeleteClick = (student) => {
    setDeletingStudent(student);
  };

  // Handle Delete Confirm
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);

    try {
      await studentApi.deleteStudent(deletingStudent.id);
      showToast('Student deleted successfully.', 'success');
      // If we were editing the deleted student, reset edit mode
      if (editingStudent && editingStudent.id === deletingStudent.id) {
        setEditingStudent(null);
      }
      setDeletingStudent(null);
      await fetchStudents();
    } catch (err) {
      console.error('Delete student failed:', err);
      showToast(
        err.message || 'Failed to delete student record.',
        'error',
        'Delete Failed'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel Delete
  const handleCancelDelete = () => {
    if (!isDeleting) {
      setDeletingStudent(null);
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingStudent)}
        title="Confirm Student Deletion"
        message="Are you sure you want to delete this student?"
        studentName={deletingStudent ? `${deletingStudent.name} (${deletingStudent.register_number})` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {/* Main Header / Navbar */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-logo">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="brand-title">Student Management System</h1>
              <p className="brand-subtitle">Manage student records easily</p>
            </div>
          </div>

          <div className="header-badges">
            <div className="stat-pill" id="total-students-stat">
              <Users size={16} />
              <span>Total: <strong>{students.length}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="main-content">
        <div className="content-container">
          {/* Top Form Section */}
          <section aria-label="Student Form Section">
            <StudentForm
              editingStudent={editingStudent}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelEdit}
              isSubmitting={isSubmitting}
              serverErrors={formServerErrors}
            />
          </section>

          {/* Search and Records Section */}
          <section className="records-section" aria-label="Student Records Section">
            <div className="records-header-bar">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                totalCount={students.length}
                filteredCount={filteredStudents.length}
              />
            </div>

            <StudentList
              students={filteredStudents}
              isLoading={isLoading}
              error={serverError}
              onEdit={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onRetry={fetchStudents}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} Student Management System • Full-Stack Django REST & React</p>
          <div className="footer-tags">
            <span className="footer-tag">Django 5</span>
            <span className="footer-tag">React 19</span>
            <span className="footer-tag">SQLite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
