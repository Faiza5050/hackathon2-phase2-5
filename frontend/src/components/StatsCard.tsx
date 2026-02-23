/**
 * StatsCard component for displaying dashboard statistics
 */
import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export function StatsCard({ title, value, icon, color = 'primary' }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-dark',
    danger: 'bg-danger text-white',
    info: 'bg-info text-white',
  };

  return (
    <div className={`card ${colorClasses[color]} border-0 shadow-sm`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-subtitle mb-2 opacity-75">{title}</h6>
            <h2 className="card-title mb-0 fw-bold">{value}</h2>
          </div>
          {icon && <div className="fs-1 opacity-50">{icon}</div>}
        </div>
      </div>
    </div>
  );
}
