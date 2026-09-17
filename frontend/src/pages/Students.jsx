import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentTable from '../components/StudentTable';
import ConfirmDialog from '../components/ConfirmDialog';

const Students = ({
  students = [],
  isLoading = false,
  serverError = null,
  onRefresh,
  onDeleteStudent,
  departments = [],
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', year: '', gender: '', status: '' });

  const [viewingStudent, setViewingStudent] = useState(null);

  // Delete confirm state
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter students based on searchTerm across Name, Register Number, Department, and Email
  const filteredStudents = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const name = (student.name || '').toLowerCase();
      const reg = (student.register_number || '').toLowerCase();
      const dept = (student.department_name || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      const matchesFilters = (!filters.department || String(student.department) === filters.department) && (!filters.year || String(student.year) === filters.year) && (!filters.gender || student.gender === filters.gender) && (!filters.status || student.status === filters.status);
      return matchesFilters && (
        name.includes(query) ||
        reg.includes(query) ||
        dept.includes(query) ||
        email.includes(query)
      );
    });
  }, [students, searchTerm, filters]);

  // Open Add modal
  const handleOpenAdd = () => {
    navigate('/students/add');
  };

  const handleOpenEdit = (student) => {
    navigate(`/students/edit/${student.id}`);
  };

  // Delete modal open
  const handleOpenDelete = (student) => {
    setDeletingStudent(student);
  };

  // Delete modal close
  const handleCloseDelete = () => {
    if (!isDeleting) {
      setDeletingStudent(null);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      await onDeleteStudent(deletingStudent.id);
      setDeletingStudent(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="students-page" id="students-view">
      {/* Delete Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingStudent)}
        title="Confirm Student Deletion"
        message="Are you sure you want to delete this student?"
        studentName={
          deletingStudent
            ? `${deletingStudent.name} (${deletingStudent.register_number})`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDelete}
        isDeleting={isDeleting}
      />

      {/* Main Student Records Section */}
      <div className="student-filters card"><select className="form-select" value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })}><option value="">All Departments</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select><select className="form-select" value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })}><option value="">All Years</option>{['1st', '2nd', '3rd', '4th'].map((label, index) => <option key={label} value={index + 1}>{label} Year</option>)}</select><select className="form-select" value={filters.gender} onChange={(event) => setFilters({ ...filters, gender: event.target.value })}><option value="">All Genders</option><option value="male">Male</option><option value="female">Female</option></select><select className="form-select" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All Statuses</option><option value="active">Active</option><option value="graduated">Graduated</option><option value="left_college">Left College</option></select></div>
      <section className="records-section" aria-label="Student Records Management">
        <StudentTable
          students={filteredStudents}
          allStudentsCount={students.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm('')}
          isLoading={isLoading}
          error={serverError}
          onAddClick={handleOpenAdd}
          onEditClick={handleOpenEdit}
          onDeleteClick={handleOpenDelete}
          onViewClick={setViewingStudent}
          onRetry={onRefresh}
        />
      </section>
      {viewingStudent && (
        <div className="modal-backdrop" onClick={() => setViewingStudent(null)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><h2 className="modal-title">Student Details</h2><p className="card-subtitle">{viewingStudent.name}</p></div><button type="button" className="modal-close-btn" onClick={() => setViewingStudent(null)} aria-label="Close details">x</button></div>
            <div className="details-grid"><h3>Student Information</h3><p><strong>Register Number</strong>{viewingStudent.register_number}</p><p><strong>Email</strong>{viewingStudent.email}</p><p><strong>Gender</strong>{viewingStudent.gender || 'Not entered'}</p><p><strong>Department</strong>{viewingStudent.department_name || 'Unassigned'}</p><p><strong>Year</strong>{viewingStudent.year}</p><p><strong>Phone</strong>{viewingStudent.phone}</p><h3>Academic Information</h3><p><strong>Cutoff Mark</strong>{viewingStudent.cutoff_mark ?? 'Not entered'}</p><p><strong>Previous Semester Percentage</strong>{viewingStudent.previous_semester_percentage ?? 'Not entered'}</p><p><strong>CGPA</strong>{viewingStudent.cgpa ?? 'Not entered'}</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
