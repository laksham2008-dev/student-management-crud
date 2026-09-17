import React from 'react';
import { Edit2, Trash2, Users, AlertCircle, RefreshCw, GraduationCap, UserPlus, Eye } from 'lucide-react';
import SearchBar from './SearchBar';

const StudentTable = ({
  students,
  allStudentsCount,
  searchTerm,
  onSearchChange,
  onClearSearch,
  isLoading,
  error,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onViewClick,
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
    <div className="card table-card" id="student-records-card">
      {/* Card Header with Title and Actions */}
      <div className="card-header records-card-header">
        <div className="card-title-group">
          <div className="card-icon-badge list-badge" aria-hidden="true">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="card-title">Student Records</h2>
            <p className="card-subtitle">
              {allStudentsCount === 1
                ? '1 student registered in database'
                : `${allStudentsCount} students registered in database`}
            </p>
          </div>
        </div>

        <div className="records-header-actions">
          <button
            type="button"
            id="refresh-list-btn"
            className="btn-icon"
            onClick={onRetry}
            title="Refresh student records"
            aria-label="Refresh student records"
            disabled={isLoading}
          >
            <RefreshCw size={17} className={isLoading ? 'spin' : ''} />
          </button>

          <button
            type="button"
            id="open-add-modal-btn"
            className="btn btn-primary btn-add-student"
            onClick={onAddClick}
          >
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="records-filter-bar">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onClear={onClearSearch}
          totalCount={allStudentsCount}
          filteredCount={students.length}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="state-container loading-state" id="students-loading-state">
          <div className="spinner" aria-hidden="true"></div>
          <h3 className="state-title">Loading students...</h3>
          <p className="state-text">Fetching latest records from Django backend</p>
        </div>
      )}

      {/* Server Offline / Connection Error State */}
      {!isLoading && error && (
        <div className="state-container error-state" id="students-error-state">
          <div className="error-icon-circle">
            <AlertCircle size={36} className="error-icon" />
          </div>
          <h3 className="state-title">Unable to connect to the server</h3>
          <p className="state-text">
            Please make sure the Django backend is running at http://127.0.0.1:8000/
          </p>
          <button
            type="button"
            id="retry-connection-btn"
            className="btn btn-secondary mt-3"
            onClick={onRetry}
          >
            <RefreshCw size={15} /> Retry Connection
          </button>
        </div>
      )}

      {/* Empty State (No records at all) */}
      {!isLoading && !error && allStudentsCount === 0 && (
        <div className="state-container empty-state" id="students-empty-state">
          <div className="empty-icon-circle" aria-hidden="true">
            <Users size={36} />
          </div>
          <h3 className="state-title">No students found</h3>
          <p className="state-text">
            Add your first student to get started.
          </p>
          <button
            type="button"
            id="empty-state-add-btn"
            className="btn btn-primary mt-3"
            onClick={onAddClick}
          >
            <UserPlus size={16} />
            <span>+ Add Student</span>
          </button>
        </div>
      )}

      {/* Search No Results State (Search filtered everything out) */}
      {!isLoading && !error && allStudentsCount > 0 && students.length === 0 && (
        <div className="state-container empty-state" id="students-no-search-results">
          <div className="empty-icon-circle" aria-hidden="true">
            <Users size={36} />
          </div>
          <h3 className="state-title">No matching student records</h3>
          <p className="state-text">
            No records matched "{searchTerm}". Try checking for spelling or search with a different keyword.
          </p>
          <button
            type="button"
            id="clear-search-empty-btn"
            className="btn btn-secondary mt-3"
            onClick={onClearSearch}
          >
            Clear Search Filter
          </button>
        </div>
      )}

      {/* Student Records Table */}
      {!isLoading && !error && students.length > 0 && (
        <div className="table-responsive">
          <table className="student-table" id="student-records-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '64px' }}>ID</th>
                <th scope="col">Name</th>
                <th scope="col">Register Number</th>
                <th scope="col">Email</th>
                <th scope="col">Gender</th>
                <th scope="col">Department</th>
                <th scope="col">Year</th>
                <th scope="col">Phone</th>
                <th scope="col">Backlogs</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ width: '160px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const initials = student.name
                  ? student.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0].toUpperCase())
                      .join('')
                  : '?';

                return (
                  <tr key={student.id} id={`student-row-${student.id}`}>
                    <td className="cell-id">
                      <span className="id-tag">#{student.id}</span>
                    </td>
                    <td className="cell-name">
                      <div className="student-avatar-cell">
                        <div className="student-avatar" aria-hidden="true">
                          {initials}
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
                    <td className="cell-gender">{student.gender || 'Not entered'}</td>
                    <td className="cell-dept">
                      <span className="dept-badge">{student.department_name || 'Unassigned'}</span>
                    </td>
                    <td className="cell-year">{getYearBadge(student.year)}</td>
                    <td className="cell-phone">
                      <span className="phone-text">{student.phone}</span>
                    </td>
                    <td>{student.backlog_count ? `${student.backlog_count} Backlogs` : 'No Backlogs'}</td>
                    <td>{student.status || 'Active'}</td>
                    <td className="cell-actions">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => onViewClick(student)}
                          title={`View ${student.name}`}
                          aria-label={`View ${student.name}`}
                        >
                          <Eye size={14} />
                          <span className="action-label">View</span>
                        </button>
                        <button
                          type="button"
                          id={`edit-student-btn-${student.id}`}
                          className="btn-action btn-edit"
                          onClick={() => onEditClick(student)}
                          title={`Edit ${student.name}`}
                          aria-label={`Edit ${student.name}`}
                        >
                          <Edit2 size={14} />
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
                          <Trash2 size={14} />
                          <span className="action-label">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
