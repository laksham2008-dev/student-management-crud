import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Sparkles } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const handleAddStudent = () => {
    navigate('/students/add');
  };

  const handleViewStudents = () => {
    navigate('/students');
  };

  return (
    <div className="card quick-actions-card" id="quick-actions-card">
      <div className="card-header quick-actions-header">
        <div className="card-title-group">
          <div className="card-icon-badge card-icon-blue" aria-hidden="true">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="card-title">Quick Actions</h2>
            <p className="card-subtitle">Frequently used management shortcuts</p>
          </div>
        </div>
      </div>

      <div className="quick-actions-body">
        <button
          type="button"
          id="quick-add-student-btn"
          className="btn btn-primary quick-action-btn"
          onClick={handleAddStudent}
        >
          <UserPlus size={18} />
          <span>Add Student</span>
        </button>

        <button
          type="button"
          id="quick-view-students-btn"
          className="btn btn-secondary quick-action-btn"
          onClick={handleViewStudents}
        >
          <Users size={18} />
          <span>View Students</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
