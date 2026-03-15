/**
 * TaskListSkeleton Component
 * 
 * Loading skeleton for task list.
 * Displays placeholder rows while data is loading.
 */
'use client';

import React from 'react';

interface TaskListSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * TaskListSkeleton component
 */
export function TaskListSkeleton({ count = 5, className = '' }: TaskListSkeletonProps) {
  return (
    <div className={`task-list-skeleton ${className}`}>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">
                <div className="skeleton-header skeleton" />
              </th>
              <th scope="col">
                <div className="skeleton-header skeleton" />
              </th>
              <th scope="col">
                <div className="skeleton-header skeleton" />
              </th>
              <th scope="col" className="d-none d-lg-table-cell">
                <div className="skeleton-header skeleton" />
              </th>
              <th scope="col">
                <div className="skeleton-header skeleton" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="skeleton-title skeleton mb-2" />
                      <div className="skeleton-description skeleton" />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="skeleton-badge skeleton" />
                </td>
                <td>
                  <div className="skeleton-date skeleton" />
                </td>
                <td className="d-none d-lg-table-cell">
                  <div className="skeleton-date skeleton" />
                </td>
                <td>
                  <div className="skeleton-actions skeleton" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-header {
          height: 16px;
          width: 100px;
        }

        .skeleton-title {
          height: 18px;
          width: 200px;
        }

        .skeleton-description {
          height: 14px;
          width: 150px;
        }

        .skeleton-badge {
          height: 24px;
          width: 80px;
        }

        .skeleton-date {
          height: 16px;
          width: 100px;
        }

        .skeleton-actions {
          height: 32px;
          width: 120px;
        }
      `}</style>
    </div>
  );
}

export default TaskListSkeleton;
