/**
 * Tests for DashboardPage component
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '../utils/render';
import { useRouter } from 'next/navigation';
import DashboardPage from '@/app/dashboard/page';
import { dashboardService } from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock dashboard service
jest.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getDashboard: jest.fn(),
  },
}));

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: () => mockUseAuth(),
}));

const mockPush = jest.fn();

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com', id: 'test-user-id' },
      logout: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
    });
  });

  it('test_render_dashboard_success - Shows stats and recent tasks', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 10,
        pending_tasks: 3,
        in_progress_tasks: 4,
        completed_tasks: 3,
        overdue_tasks: 1,
      },
      recent_tasks: [
        {
          id: 'task-1',
          title: 'Task 1',
          status: 'pending',
          due_date: '2026-03-20T00:00:00Z',
          created_at: '2026-03-15T00:00:00Z',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          status: 'in_progress',
          due_date: '2026-03-21T00:00:00Z',
          created_at: '2026-03-14T00:00:00Z',
        },
      ],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check stats cards - use getAllByText for values that may appear multiple times
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Check recent tasks table
    expect(screen.getByText('Recent Tasks')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('test_render_dashboard_loading - Shows loading state initially', () => {
    (dashboardService.getDashboard as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<DashboardPage />);

    // Check for loading spinner (skeleton)
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });

  it('test_render_dashboard_error - Shows error state on failure', async () => {
    (dashboardService.getDashboard as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch dashboard')
    );

    render(<DashboardPage />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch dashboard')).toBeInTheDocument();
  });

  it('test_render_dashboard_empty - Shows empty state when no tasks', async () => {
    const mockEmptyData = {
      summary: {
        total_tasks: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockEmptyData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check for empty state
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(
      screen.getByText('Get started by creating your first task!')
    ).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('test_handle_logout - Logout works correctly', async () => {
    const mockLogout = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com', id: 'test-user-id' },
      logout: mockLogout,
      isLoading: false,
    });

    const mockDashboardData = {
      summary: {
        total_tasks: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Verify logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);

    // Verify navigation to login page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('test_overdue_warning - Shows overdue warning when tasks overdue', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 5,
        pending_tasks: 2,
        in_progress_tasks: 1,
        completed_tasks: 2,
        overdue_tasks: 3,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check for overdue warning - use regex to match the full warning text
    expect(screen.getByText(/You have 3 overdue task/)).toBeInTheDocument();
  });

  it('test_stats_colors - Stats cards have correct colors', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 10,
        pending_tasks: 3,
        in_progress_tasks: 4,
        completed_tasks: 3,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check for color classes (Bootstrap color classes)
    // Total Tasks - primary
    const totalCard = screen.getByText('Total Tasks').closest('.card');
    expect(totalCard).toHaveClass('bg-primary');

    // Pending - warning
    const pendingCard = screen.getByText('Pending').closest('.card');
    expect(pendingCard).toHaveClass('bg-warning');

    // In Progress - info
    const inProgressCard = screen.getByText('In Progress').closest('.card');
    expect(inProgressCard).toHaveClass('bg-info');

    // Completed - success
    const completedCard = screen.getByText('Completed').closest('.card');
    expect(completedCard).toHaveClass('bg-success');
  });

  it('test_recent_tasks_table - Recent tasks displayed in table', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 5,
        pending_tasks: 2,
        in_progress_tasks: 1,
        completed_tasks: 2,
        overdue_tasks: 0,
      },
      recent_tasks: [
        {
          id: 'task-1',
          title: 'Important Task',
          status: 'pending',
          due_date: '2026-03-20T00:00:00Z',
          created_at: '2026-03-15T00:00:00Z',
        },
        {
          id: 'task-2',
          title: 'In Progress Task',
          status: 'in_progress',
          due_date: null,
          created_at: '2026-03-14T00:00:00Z',
        },
        {
          id: 'task-3',
          title: 'Completed Task',
          status: 'completed',
          due_date: '2026-03-10T00:00:00Z',
          created_at: '2026-03-13T00:00:00Z',
        },
      ],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Tasks')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();

    // Check task data
    expect(screen.getByText('Important Task')).toBeInTheDocument();
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText('pending')).toHaveClass('badge');
    expect(screen.getByText('in_progress')).toHaveClass('badge');
    expect(screen.getByText('completed')).toHaveClass('badge');
  });

  it('test_retry_on_error - Calls retry when error occurs', async () => {
    // First call fails, second call succeeds
    (dashboardService.getDashboard as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        summary: {
          total_tasks: 0,
          pending_tasks: 0,
          in_progress_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
        },
        recent_tasks: [],
      });

    render(<DashboardPage />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);

    // Wait for data to load after retry
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Verify getDashboard was called twice (initial + retry)
    expect(dashboardService.getDashboard).toHaveBeenCalledTimes(2);
  });

  it('test_refresh_button - Shows refresh button and works correctly', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 5,
        pending_tasks: 2,
        in_progress_tasks: 1,
        completed_tasks: 2,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock)
      .mockResolvedValueOnce(mockDashboardData)
      .mockResolvedValueOnce({
        ...mockDashboardData,
        summary: { ...mockDashboardData.summary, total_tasks: 10 },
      });

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check refresh button exists
    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveAttribute('aria-label', 'Refresh dashboard');

    // Click refresh button
    fireEvent.click(refreshButton);

    // Wait for refresh to complete
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    // Verify getDashboard was called twice (initial + refresh)
    expect(dashboardService.getDashboard).toHaveBeenCalledTimes(2);
  });

  it('test_last_updated_timestamp - Shows last updated time after successful load', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 5,
        pending_tasks: 2,
        in_progress_tasks: 1,
        completed_tasks: 2,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check last updated timestamp exists
    const lastUpdated = screen.getByTestId('last-updated');
    expect(lastUpdated).toBeInTheDocument();
    expect(lastUpdated).toHaveTextContent(/Last updated:/);
  });

  it('test_refresh_button_loading_state - Shows loading spinner during refresh', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 5,
        pending_tasks: 2,
        in_progress_tasks: 1,
        completed_tasks: 2,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    // Mock a slow response
    (dashboardService.getDashboard as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockDashboardData), 100))
    );

    render(<DashboardPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    // Check for loading state
    expect(refreshButton).toBeDisabled();
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();

    // Wait for refresh to complete
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('test_responsive_layout - Stats cards use responsive grid classes', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 10,
        pending_tasks: 3,
        in_progress_tasks: 4,
        completed_tasks: 3,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check for responsive grid classes
    const statsCards = screen.getAllByRole('article');
    expect(statsCards).toHaveLength(4);

    // Each card should have responsive classes
    statsCards.forEach((card) => {
      expect(card).toHaveClass('col-12');
      expect(card).toHaveClass('col-sm-6');
      expect(card).toHaveClass('col-lg-3');
    });
  });

  it('test_no_overdue_warning - No overdue warning when overdue_tasks = 0', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 5,
        pending_tasks: 2,
        in_progress_tasks: 1,
        completed_tasks: 2,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check that overdue warning is not shown
    expect(screen.queryByText(/overdue task/i)).not.toBeInTheDocument();
  });

  it('test_view_all_tasks_link - Link to /tasks page is present', async () => {
    const mockDashboardData = {
      summary: {
        total_tasks: 5,
        pending_tasks: 2,
        in_progress_tasks: 1,
        completed_tasks: 2,
        overdue_tasks: 0,
      },
      recent_tasks: [],
    };

    (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    // Check for View All Tasks link
    const viewAllLink = screen.getByText('View All Tasks');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', '/tasks');
  });
});
