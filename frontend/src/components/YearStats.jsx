import React from 'react';
import { Calendar } from 'lucide-react';

const YearStats = ({ students = [] }) => {
  // Calculate counts for each year dynamically
  const yearCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  students.forEach((student) => {
    const yearNum = Number(student.year);
    if (yearCounts[yearNum] !== undefined) {
      yearCounts[yearNum] += 1;
    }
  });

  const total = students.length;

  const yearData = [
    {
      year: 1,
      label: '1st Year',
      subtitle: 'Freshmen',
      count: yearCounts[1],
      badgeClass: 'year-1',
      barColor: '#3b82f6',
      iconClass: 'year-icon-blue',
    },
    {
      year: 2,
      label: '2nd Year',
      subtitle: 'Sophomores',
      count: yearCounts[2],
      badgeClass: 'year-2',
      barColor: '#10b981',
      iconClass: 'year-icon-emerald',
    },
    {
      year: 3,
      label: '3rd Year',
      subtitle: 'Juniors',
      count: yearCounts[3],
      badgeClass: 'year-3',
      barColor: '#f59e0b',
      iconClass: 'year-icon-amber',
    },
    {
      year: 4,
      label: '4th Year',
      subtitle: 'Seniors',
      count: yearCounts[4],
      badgeClass: 'year-4',
      barColor: '#8b5cf6',
      iconClass: 'year-icon-purple',
    },
  ];

  return (
    <div className="card year-stats-card" id="students-by-year-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge list-badge" aria-hidden="true">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="card-title">Students by Year</h2>
            <p className="card-subtitle">Distribution across academic levels</p>
          </div>
        </div>
      </div>

      <div className="year-stats-body">
        <div className="year-cards-grid">
          {yearData.map((item) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.year} className="year-stat-card" id={`year-stat-${item.year}`}>
                <div className="year-stat-header">
                  <span className={`year-badge ${item.badgeClass}`}>{item.label}</span>
                  <span className="year-percentage">{percentage}%</span>
                </div>
                <div className="year-stat-count-wrapper">
                  <span className="year-stat-count">{item.count}</span>
                  <span className="year-stat-count-label">
                    {item.count === 1 ? 'Student' : 'Students'}
                  </span>
                </div>
                <div className="year-stat-progress-bg">
                  <div
                    className="year-stat-progress-bar"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.barColor,
                    }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default YearStats;
