/**
 * Dashboard page component
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { dashboardService, type DashboardData } from '../../services/dashboardService';
import { StatsCard } from '../../components/StatsCard';
import { EmptyState } from '../../components/EmptyState';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await dashboardService.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
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
        <h1 className="mb-4">Dashboard</h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {dashboard && (
          <>
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <StatsCard
                  title="Total Tasks"
                  value={dashboard.summary.total_tasks}
                  color="primary"
                />
              </div>
              <div className="col-md-3">
                <StatsCard
                  title="Pending"
                  value={dashboard.summary.pending_tasks}
                  color="warning"
                />
              </div>
              <div className="col-md-3">
                <StatsCard
                  title="In Progress"
                  value={dashboard.summary.in_progress_tasks}
                  color="info"
                />
              </div>
              <div className="col-md-3">
                <StatsCard
                  title="Completed"
                  value={dashboard.summary.completed_tasks}
                  color="success"
                />
              </div>
            </div>

            {dashboard.summary.overdue_tasks > 0 && (
              <div className="alert alert-danger mb-4">
                <strong>Warning:</strong> You have {dashboard.summary.overdue_tasks} overdue task(s)!
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
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Due Date</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recent_tasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.title}</td>
                            <td>
                              <span className={`badge ${
                                task.status === 'completed' ? 'bg-success' :
                                task.status === 'in_progress' ? 'bg-info' :
                                'bg-warning'
                              }`}>
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
