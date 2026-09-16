import React from 'react';
import { Edit2, Trash2, Users, AlertCircle, RefreshCw, GraduationCap } from 'lucide-react';

const StudentList = ({
  students,
  isLoading,
  error,
  onEdit,
  onDeleteClick,
  onRetry,
}) => {
  const getYearBadge = (year) => {
    switch (Number(year)) {
      case 1:
        return <span className="year-badge year-1">1st Year</span>;
      case 2:
        return <span className="year-badge year-2">2nd Year</span>;
      case 3:
        return <span className="year-badge year-3">3rd Year</span>;
      case 4:
        return <span className="year-badge year-4">4th Year</span>;
      default:
        return <span className="year-badge">{year} Year</span>;
    }
  };

  return (
    <div className="card table-card" id="student-list-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge list-badge">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="card-title">Enrolled Students</h2>
            <p className="card-subtitle">
              {students.length === 1 ? '1 student record found' : `${students.length} student records found`}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="refresh-list-btn"
          className="btn-icon"
          onClick={onRetry}
          title="Refresh students list"
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="state-container loading-state" id="students-loading-state">
          <div className="spinner"></div>
          <p className="state-text">Loading students...</p>
        </div>
      )}

      {/* Error / Offline State */}
      {!isLoading && error && (
        <div className="state-container error-state" id="students-error-state">
          <AlertCircle size={36} className="error-icon" />
          <h3 className="state-title">Connection Error</h3>
          <p className="state-text">
            {error || "Unable to connect to the server. Please make sure the backend is running."}
          </p>
          <button
            type="button"
            id="retry-connection-btn"
            className="btn btn-secondary mt-3"
            onClick={onRetry}
          >
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && students.length === 0 && (
        <div className="state-container empty-state" id="students-empty-state">
          <div className="empty-icon-circle">
            <Users size={36} />
          </div>
          <h3 className="state-title">No students found.</h3>
          <p className="state-text">
            No student records match your criteria. Add a new student above to get started.
          </p>
        </div>
      )}

      {/* Student Table */}
      {!isLoading && !error && students.length > 0 && (
        <div className="table-responsive">
          <table className="student-table" id="student-records-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '60px' }}>ID</th>
                <th scope="col">Name</th>
                <th scope="col">Register No.</th>
                <th scope="col">Email</th>
                <th scope="col">Department</th>
                <th scope="col">Year</th>
                <th scope="col">Phone</th>
                <th scope="col" style={{ width: '130px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} id={`student-row-${student.id}`}>
                  <td className="cell-id">
                    <span className="id-tag">#{student.id}</span>
                  </td>
                  <td className="cell-name">
                    <div className="student-avatar-cell">
                      <div className="student-avatar">
                        {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="student-name-text">
                        <strong>{student.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td className="cell-reg">
                    <code className="reg-code">{student.register_number}</code>
                  </td>
                  <td className="cell-email">
                    <a href={`mailto:${student.email}`} className="email-link">
                      {student.email}
                    </a>
                  </td>
                  <td className="cell-dept">
                    <span className="dept-badge">{student.department}</span>
                  </td>
                  <td className="cell-year">{getYearBadge(student.year)}</td>
                  <td className="cell-phone">
                    <span className="phone-text">{student.phone}</span>
                  </td>
                  <td className="cell-actions">
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        id={`edit-student-btn-${student.id}`}
                        className="btn-action btn-edit"
                        onClick={() => onEdit(student)}
                        title={`Edit ${student.name}`}
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit2 size={15} />
                        <span className="action-label">Edit</span>
                      </button>
                      <button
                        type="button"
                        id={`delete-student-btn-${student.id}`}
                        className="btn-action btn-delete"
                        onClick={() => onDeleteClick(student)}
                        title={`Delete ${student.name}`}
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 size={15} />
                        <span className="action-label">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentList;
