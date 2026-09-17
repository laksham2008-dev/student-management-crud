import React, { useMemo } from 'react';
import { Building2, PieChart } from 'lucide-react';

const DEPARTMENT_COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#059669', // Emerald
  '#ea580c', // Orange
  '#475569', // Slate
];

const DepartmentChart = ({ students = [] }) => {
  // Aggregate department counts dynamically from real student records
  const departmentData = useMemo(() => {
    if (!students || students.length === 0) {
      return [];
    }

    const counts = {};
    students.forEach((student) => {
      const dept = (student.department_name || 'Unassigned').trim();
      counts[dept] = (counts[dept] || 0) + 1;
    });

    const total = students.length;
    return Object.keys(counts)
      .map((dept, index) => ({
        name: dept,
        count: counts[dept],
        percentage: ((counts[dept] / total) * 100).toFixed(1),
        color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  const maxCount = departmentData.length > 0 ? Math.max(...departmentData.map((d) => d.count)) : 1;

  return (
    <div className="card department-chart-card" id="students-by-department-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge card-icon-indigo" aria-hidden="true">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="card-title">Students by Department</h2>
            <p className="card-subtitle">Distribution across academic departments</p>
          </div>
        </div>
      </div>

      <div className="department-chart-body">
        {departmentData.length === 0 ? (
          <div className="chart-empty-state" id="dept-empty-state">
            <div className="chart-empty-icon" aria-hidden="true">
              <PieChart size={32} />
            </div>
            <p className="chart-empty-text">No department data available</p>
            <span className="chart-empty-subtext">Add student records to view department analytics</span>
          </div>
        ) : (
          <div className="dept-bars-container">
            {departmentData.map((item, idx) => {
              const barWidth = Math.max((item.count / maxCount) * 100, 8);
              return (
                <div key={item.name} className="dept-bar-row" id={`dept-bar-${idx}`}>
                  <div className="dept-bar-label-group">
                    <span className="dept-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span className="dept-name" title={item.name}>
                      {item.name}
                    </span>
                    <span className="dept-count-badge">
                      {item.count} {item.count === 1 ? 'student' : 'students'} ({item.percentage}%)
                    </span>
                  </div>

                  <div className="dept-bar-track">
                    <div
                      className="dept-bar-fill"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: item.color,
                      }}
                      role="progressbar"
                      aria-valuenow={item.count}
                      aria-valuemin="0"
                      aria-valuemax={maxCount}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentChart;
