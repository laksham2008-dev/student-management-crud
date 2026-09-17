import React from 'react';
import { Users, UserRound, UserRoundCheck } from 'lucide-react';

const DashboardCards = ({ students = [], departments = [] }) => {
  // 1. Total Students
  const totalCount = students.length;

  const maleCount = students.filter((student) => student.gender === 'male').length;
  const femaleCount = students.filter((student) => student.gender === 'female').length;

  const cardsData = [
    {
      id: 'stat-total-students',
      label: 'Total Students',
      value: totalCount,
      subtext: totalCount === 1 ? '1 student enrolled' : `${totalCount} students enrolled`,
      icon: Users,
      colorClass: 'card-icon-blue',
    },
    {
      id: 'stat-male-students', label: 'Male Students', value: maleCount, subtext: 'From saved student records', icon: UserRound, colorClass: 'card-icon-indigo',
    },
    {
      id: 'stat-female-students', label: 'Female Students', value: femaleCount, subtext: 'From saved student records', icon: UserRoundCheck, colorClass: 'card-icon-amber',
    },
    { id: 'stat-total-departments', label: 'Total Departments', value: departments.length, subtext: 'Configured departments', icon: Users, colorClass: 'card-icon-emerald' },
  ];

  return (
    <section className="dashboard-cards-grid" aria-label="Summary Overview Cards">
      {cardsData.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} id={card.id} className="summary-card">
            <div className="summary-card-body">
              <div className="summary-card-info">
                <span className="summary-card-label">{card.label}</span>
                <span
                  className={`summary-card-value ${card.isTextValue ? 'summary-card-value-text' : ''}`}
                  title={typeof card.value === 'string' ? card.value : undefined}
                >
                  {card.value}
                </span>
                <span className="summary-card-subtext">{card.subtext}</span>
              </div>
              <div className={`summary-card-icon ${card.colorClass}`} aria-hidden="true">
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default DashboardCards;
