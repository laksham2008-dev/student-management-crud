import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Users } from 'lucide-react';

const RecentStudents = ({ students = [] }) => {
  // Take up to 5 latest students
  const recentStudents = students.slice(0, 5);

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
    <div className="card recent-students-card" id="recent-students-card">
      <div className="card-header records-card-header">
        <div className="card-title-group">
          <div className="card-icon-badge card-icon-emerald" aria-hidden="true">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="card-title">Recently Added Students</h2>
            <p className="card-subtitle">Latest enrollments in the system</p>
          </div>
        </div>

        <Link to="/students" className="btn btn-secondary btn-view-all" id="view-all-students-btn">
          <span>View All Students</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="recent-students-body">
        {recentStudents.length === 0 ? (
          <div className="recent-empty-state" id="recent-empty-state">
            <div className="empty-icon-circle" aria-hidden="true">
              <Users size={32} />
            </div>
            <p className="recent-empty-text">No students have been added yet.</p>
            <Link to="/students" state={{ openAddModal: true }} className="btn btn-primary mt-3" id="recent-add-first-btn">
              <span>+ Add Student</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="student-table recent-table" id="recent-students-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Register Number</th>
                  <th scope="col">Department</th>
                  <th scope="col">Year</th>
                  <th scope="col">Gender</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => {
                  const initials = student.name
                    ? student.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0].toUpperCase())
                        .join('')
                    : '?';

                  return (
                    <tr key={student.id} id={`recent-student-${student.id}`}>
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
                      <td className="cell-dept">
                        <span className="dept-badge">{student.department_name || 'Unassigned'}</span>
                      </td>
                      <td className="cell-year">{getYearBadge(student.year)}</td>
                      <td>{student.gender || 'Not entered'}</td>
                      <td className="cell-email">
                        <a href={`mailto:${student.email}`} className="email-link">
                          {student.email}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentStudents;
