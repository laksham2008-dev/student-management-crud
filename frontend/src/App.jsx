import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import studentApi, { departmentApi, settingsApi, authApi } from './services/api';
import Header from './components/Header';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Departments from './pages/Departments';
import StudentEditor from './pages/StudentEditor';
import Settings from './pages/Settings';
import { SetupPage, LoginPage } from './pages/AuthPages';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [isCollegeConfigured, setIsCollegeConfigured] = useState(false);
  const [collegeSetupName, setCollegeSetupName] = useState('');
  const [isSavingCollege, setIsSavingCollege] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('student_management_token')));
  const [authChecked, setAuthChecked] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [formServerErrors, setFormServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Helper to show toast messages
  const showToast = useCallback((message, type = 'success', title = '') => {
    setToast({ message, type, title });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch all students from the backend API
  const fetchStudents = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setServerError(null);
    try {
      const data = await studentApi.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error('Fetch students failed:', err);
      const errorMsg = 'Unable to connect to the server. Please make sure the Django backend is running.';
      setServerError(errorMsg);
      showToast(errorMsg, 'error', 'Connection Error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, isAuthenticated]);

  const fetchDepartments = useCallback(async () => {
    if (!isAuthenticated) return;
    setDepartmentsLoading(true);
    setDepartmentsError('');
    try {
      setDepartments(await departmentApi.getAll());
    } catch (err) {
      setDepartmentsError('Unable to load departments. Please try again.');
      showToast('Unable to load departments. Please try again.', 'error', 'Department Error');
    } finally {
      setDepartmentsLoading(false);
    }
  }, [showToast, isAuthenticated]);

  const fetchCollegeSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await settingsApi.get();
      if (result.configured && result.data) {
        setCollegeName(result.data.college_name);
        setIsCollegeConfigured(true);
      }
    } catch (err) {
      showToast(err.message || 'Unable to load college settings.', 'error', 'Connection Error');
    }
  }, [showToast, isAuthenticated]);

  const saveCollegeSetup = async (event) => {
    event.preventDefault();
    if (!collegeSetupName.trim()) return;
    setIsSavingCollege(true);
    try {
      const result = await settingsApi.save(collegeSetupName.trim());
      setCollegeName(result.data.college_name);
      setIsCollegeConfigured(true);
      showToast('College name saved successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to save college name.', 'error', 'Setup Error');
    } finally {
      setIsSavingCollege(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) { authApi.status().then((result) => setSetupRequired(!result.configured)).catch(() => setSetupRequired(false)).finally(() => setAuthChecked(true)); return; }
    Promise.all([fetchStudents(), fetchDepartments(), fetchCollegeSettings()]).finally(() => setAuthChecked(true));
  }, [isAuthenticated, fetchStudents, fetchDepartments, fetchCollegeSettings]);

  if (!authChecked) return <div className="auth-page"><div className="spinner" /></div>;
  if (!isAuthenticated) return <BrowserRouter><Routes><Route path="/setup" element={<SetupPage onAuthenticated={(data) => { setCollegeName(data?.college_name || ''); setIsAuthenticated(true); }} />} /><Route path="/login" element={<LoginPage onAuthenticated={(data) => { setCollegeName(data?.college_name || ''); setIsAuthenticated(true); }} />} /><Route path="*" element={<Navigate to={setupRequired ? '/setup' : '/login'} replace />} /></Routes></BrowserRouter>;

  // Create new student
  const handleAddStudent = async (formData) => {
    setIsSubmitting(true);
    setFormServerErrors({});
    try {
      await studentApi.createStudent(formData);
      showToast('Student added successfully.', 'success');
      await fetchStudents();
      return true;
    } catch (err) {
      console.error('Add student failed:', err);
      if (err.data && err.data.details && typeof err.data.details === 'object') {
        setFormServerErrors(err.data.details);
        showToast(
          err.message || 'Please fix the errors highlighted in the form.',
          'error',
          'Validation Error'
        );
      } else {
        showToast(
          err.message || 'An error occurred while saving the student record.',
          'error',
          'Error'
        );
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing student
  const handleUpdateStudent = async (id, formData) => {
    setIsSubmitting(true);
    setFormServerErrors({});
    try {
      await studentApi.updateStudent(id, formData);
      showToast('Student updated successfully.', 'success');
      await fetchStudents();
      return true;
    } catch (err) {
      console.error('Update student failed:', err);
      if (err.data && err.data.details && typeof err.data.details === 'object') {
        setFormServerErrors(err.data.details);
        showToast(
          err.message || 'Please fix the errors highlighted in the form.',
          'error',
          'Validation Error'
        );
      } else {
        showToast(
          err.message || 'An error occurred while updating the student record.',
          'error',
          'Error'
        );
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id) => {
    try {
      await studentApi.deleteStudent(id);
      showToast('Student deleted successfully.', 'success');
      await fetchStudents();
      return true;
    } catch (err) {
      console.error('Delete student failed:', err);
      showToast(
        err.message || 'Failed to delete student record.',
        'error',
        'Delete Failed'
      );
      return false;
    }
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Toast Notification Container */}
        <Toast toast={toast} onClose={closeToast} />

        {/* Global Navigation Header */}
        <Header totalStudents={students.length} collegeName={collegeName} onLogout={async () => { await authApi.logout().catch(() => {}); localStorage.removeItem('student_management_token'); setIsAuthenticated(false); }} />

        {/* Main Routed Content */}
        <main className="main-content">
          <div className="content-container">
            <Routes>
              {/* Dashboard Route */}
              <Route
                path="/"
                element={
                  <Dashboard
                    students={students}
                    departments={departments}
                    isLoading={isLoading}
                    error={serverError}
                    onRetry={() => fetchStudents()}
                  />
                }
              />

              {/* Students Management Route */}
              <Route
                path="/students"
                element={
                  <Students
                    students={students}
                    isLoading={isLoading}
                    serverError={serverError}
                    onRefresh={() => fetchStudents()}
                    onDeleteStudent={handleDeleteStudent}
                    isSubmitting={isSubmitting}
                    departments={departments}
                  />
                }
              />

              <Route path="/departments" element={<Departments showToast={showToast} />} />
              <Route path="/settings" element={<Settings showToast={showToast} collegeName={collegeName} />} />
              <Route path="/students/add" element={<StudentEditor departments={departments} departmentsLoading={departmentsLoading} departmentsError={departmentsError} onRefreshDepartments={fetchDepartments} onSave={async (_, data) => handleAddStudent(data)} showToast={showToast} />} />
              <Route path="/students/edit/:id" element={<StudentEditor departments={departments} departmentsLoading={departmentsLoading} departmentsError={departmentsError} onRefreshDepartments={fetchDepartments} onSave={handleUpdateStudent} showToast={showToast} />} />

              {/* Fallback redirect to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="app-footer">
          <div className="footer-inner">
            <p>© {new Date().getFullYear()} Student Management System • Professional College Full-Stack Project</p>
            <div className="footer-tags">
              <span className="footer-tag">React Router</span>
              <span className="footer-tag">Django REST Framework</span>
              <span className="footer-tag">SQLite</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
