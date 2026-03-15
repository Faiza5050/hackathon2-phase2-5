/**
 * Dashboard page component
 * Displays task statistics and recent tasks with loading and error states
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { dashboardService, type DashboardData } from '../../services/dashboardService';
import { StatsCard } from '../../components/StatsCard';
import { EmptyState } from '../../components/EmptyState';
import { DashboardSkeleton } from '../../components/DashboardSkeleton';
import { DashboardError } from '../../components/DashboardError';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  /**
   * Load dashboard data from API
   */
  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await dashboardService.getDashboard();
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      setDashboard(null);
      setLastUpdated(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Handle retry on error
   */
  const handleRetry = useCallback(() => {
    loadDashboard();
  }, [loadDashboard]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  useEffect(() => {
    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading, loadDashboard]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Format last updated time
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    return `Last updated: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  // Show skeleton during initial load
  if (authLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div>
        <nav className="navbar navbar-dark bg-primary shadow-sm">
          <div className="container">
            <span className="navbar-brand mb-0 h1">Phase-2 Features</span>
            <div className="d-flex align-items-center">
              <span className="text-white me-3">{user?.email}</span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="container py-4">
          <DashboardError message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Phase-2 Features</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">{user?.email}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Dashboard Header with Refresh Button */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h1 className="mb-0">Dashboard</h1>
          <div className="d-flex align-items-center gap-2">
            {lastUpdated && (
              <small className="text-muted" data-testid="last-updated">
                {formatLastUpdated(lastUpdated)}
              </small>
            )}
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh dashboard"
              data-testid="refresh-button"
            >
              {isRefreshing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-clockwise me-1"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
                    />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {dashboard && (
          <>
            {/* Stats Cards - Responsive grid that stacks on mobile */}
            <div className="row g-3 mb-4" role="region" aria-label="Task Statistics">
              <div className="col-12 col-sm-6 col-lg-3" role="article" aria-label="Total Tasks">
                <StatsCard
                  title="Total Tasks"
                  value={dashboard.summary.total_tasks}
                  color="primary"
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3" role="article" aria-label="Pending Tasks">
                <StatsCard
                  title="Pending"
                  value={dashboard.summary.pending_tasks}
                  color="warning"
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3" role="article" aria-label="In Progress Tasks">
                <StatsCard
                  title="In Progress"
                  value={dashboard.summary.in_progress_tasks}
                  color="info"
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-3" role="article" aria-label="Completed Tasks">
                <StatsCard
                  title="Completed"
                  value={dashboard.summary.completed_tasks}
                  color="success"
                />
              </div>
            </div>

            {/* Overdue Warning */}
            {dashboard.summary.overdue_tasks > 0 && (
              <div
                className="alert alert-danger mb-4 d-flex align-items-center"
                role="alert"
                aria-live="polite"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="bi bi-exclamation-triangle-fill me-2"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
                <div>
                  <strong>Warning:</strong> You have {dashboard.summary.overdue_tasks} overdue
                  task{dashboard.summary.overdue_tasks > 1 ? 's' : ''}! Please review your tasks.
                </div>
              </div>
            )}

            {/* Recent Tasks */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Tasks</h5>
                  <Link href="/tasks" className="btn btn-primary btn-sm">
                    View All Tasks
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {dashboard.recent_tasks.length === 0 ? (
                  <EmptyState
                    title="No tasks yet"
                    message="Get started by creating your first task!"
                    actionLabel="Create Task"
                    actionHref="/tasks"
                  />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover" aria-label="Recent tasks table">
                      <thead>
                        <tr>
                          <th scope="col">Title</th>
                          <th scope="col">Status</th>
                          <th scope="col">Due Date</th>
                          <th scope="col">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recent_tasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.title}</td>
                            <td>
                              <span
                                className={`badge ${
                                  task.status === 'completed'
                                    ? 'bg-success'
                                    : task.status === 'in_progress'
                                    ? 'bg-info'
                                    : 'bg-warning'
                                }`}
                              >
                                {task.status}
                              </span>
                            </td>
                            <td>
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString()
                                : '—'}
                            </td>
                            <td>
                              {new Date(task.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
