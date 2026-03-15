/**
 * DashboardSkeleton component for loading state
 * Displays skeleton placeholders while dashboard data is being fetched
 */
import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="container py-4" data-testid="dashboard-skeleton">
      {/* Stats Cards Skeleton */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white border-0 shadow-sm">
            <div className="card-body">
              <div className="skeleton-text skeleton-title mb-2">&nbsp;</div>
              <div className="skeleton-value skeleton-number">&nbsp;</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark border-0 shadow-sm">
            <div className="card-body">
              <div className="skeleton-text skeleton-title mb-2">&nbsp;</div>
              <div className="skeleton-value skeleton-number">&nbsp;</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white border-0 shadow-sm">
            <div className="card-body">
              <div className="skeleton-text skeleton-title mb-2">&nbsp;</div>
              <div className="skeleton-value skeleton-number">&nbsp;</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white border-0 shadow-sm">
            <div className="card-body">
              <div className="skeleton-text skeleton-title mb-2">&nbsp;</div>
              <div className="skeleton-value skeleton-number">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Table Skeleton */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="skeleton-text skeleton-header" style={{ width: '120px' }}>&nbsp;</div>
            <div className="skeleton-btn" style={{ width: '100px' }}>&nbsp;</div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th><div className="skeleton-text" style={{ width: '80px' }}>&nbsp;</div></th>
                  <th><div className="skeleton-text" style={{ width: '60px' }}>&nbsp;</div></th>
                  <th><div className="skeleton-text" style={{ width: '80px' }}>&nbsp;</div></th>
                  <th><div className="skeleton-text" style={{ width: '80px' }}>&nbsp;</div></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    <td><div className="skeleton-text" style={{ width: '150px' }}>&nbsp;</div></td>
                    <td><div className="skeleton-badge" style={{ width: '70px' }}>&nbsp;</div></td>
                    <td><div className="skeleton-text" style={{ width: '100px' }}>&nbsp;</div></td>
                    <td><div className="skeleton-text" style={{ width: '100px' }}>&nbsp;</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .skeleton-text {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          height: 16px;
        }

        .skeleton-title {
          height: 14px;
          opacity: 0.7;
        }

        .skeleton-header {
          height: 20px;
          width: 120px;
        }

        .skeleton-value {
          height: 32px;
          width: 60px;
        }

        .skeleton-number {
          width: 40px;
          height: 36px;
        }

        .skeleton-btn {
          height: 32px;
          border-radius: 4px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-badge {
          height: 20px;
          border-radius: 10px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
