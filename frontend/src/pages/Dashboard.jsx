import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import DashboardCards from '../components/DashboardCards';
import QuickActions from '../components/QuickActions';
import YearStats from '../components/YearStats';
import DepartmentChart from '../components/DepartmentChart';
import RecentStudents from '../components/RecentStudents';

const Dashboard = ({ students = [], departments = [], isLoading = false, error = null, onRetry }) => {
  return (
    <div className="dashboard-page" id="dashboard-view">
      {/* Page Header Banner */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of student records</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            id="refresh-dashboard-btn"
            className="btn btn-secondary btn-refresh"
            onClick={onRetry}
            disabled={isLoading}
            title="Refresh dashboard data"
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            <span>{isLoading ? 'Updating...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Server Offline / Connection Error State */}
      {!isLoading && error && (
        <div className="card state-container error-state" id="dashboard-error-state">
          <div className="error-icon-circle">
            <AlertCircle size={36} className="error-icon" />
          </div>
          <h2 className="state-title">Unable to connect to the server</h2>
          <p className="state-text">
            Please make sure the Django backend is running at http://127.0.0.1:8000/
          </p>
          <button
            type="button"
            id="dashboard-retry-btn"
            className="btn btn-secondary mt-3"
            onClick={onRetry}
          >
            <RefreshCw size={15} /> Retry Connection
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card state-container loading-state" id="dashboard-loading-state">
          <div className="spinner" aria-hidden="true" />
          <h2 className="state-title">Loading dashboard...</h2>
          <p className="state-text">Fetching latest analytics from Django backend</p>
        </div>
      )}

      {/* Dashboard Main Content (shown even if 0 students, but hidden on network error) */}
      {!isLoading && !error && (
        <div className="dashboard-content-flow">
          {/* 4 Summary Cards */}
          <DashboardCards students={students} departments={departments} />

          <section className="dashboard-backlog-summary card"><div><h2 className="card-title">Backlog Summary</h2><p className="card-subtitle">Students with academic backlogs: {students.filter((student) => Number(student.backlog_count) > 0).length}</p></div><strong>{students.reduce((total, student) => total + Number(student.backlog_count || 0), 0)} Total Backlogs</strong></section>

          {/* Quick Actions Bar */}
          <QuickActions />

          {/* Analytics Grid: Year distribution & Department charts */}
          <div className="dashboard-analytics-grid">
            <YearStats students={students} />
            <DepartmentChart students={students} />
          </div>

          <section className="card dashboard-department-overview"><div className="card-header"><div><h2 className="card-title">Department Overview</h2><p className="card-subtitle">Live totals from the student database</p></div></div><div className="table-responsive"><table className="student-table"><thead><tr><th>Department</th><th>Total</th><th>Male</th><th>Female</th></tr></thead><tbody>{departments.map((department) => <tr key={department.id}><td>{department.code ? `${department.code} - ` : ''}{department.name}</td><td>{department.student_count}</td><td>{department.male_count}</td><td>{department.female_count}</td></tr>)}</tbody></table></div></section>

          {/* Recently Added Students Section */}
          <RecentStudents students={students} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
