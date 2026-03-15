/**
 * TasksPage Component Tests
 */
import { render, screen, waitFor, fireEvent } from '../utils/render';
import { useRouter } from 'next/navigation';
import TasksPage from '@/app/tasks/page';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock task service
jest.mock('@/services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

const mockTasks: Task[] = [
  {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Task 1',
    description: 'First task',
    status: 'pending',
    due_date: '2026-04-01T00:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'task-2',
    user_id: 'user-1',
    title: 'Task 2',
    description: 'Second task',
    status: 'completed',
    due_date: '2026-04-15T00:00:00Z',
    created_at: '2026-03-05T00:00:00Z',
  },
];

describe('TasksPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('should render loading state initially', async () => {
    // Simulate slow task loading
    (taskService.getTasks as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(<TasksPage />);

    // Should show task list skeleton while loading
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render tasks page with header', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('My Tasks')).toBeInTheDocument();
    });
    expect(screen.getByText('Task Management')).toBeInTheDocument();
  });

  it('should render New Task button', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('should render Dashboard link', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should render Logout button', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('should render tasks when loaded', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('should render filter controls', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
      expect(screen.getByLabelText('Order')).toBeInTheDocument();
      expect(screen.getByLabelText('Search tasks by title or description')).toBeInTheDocument();
    });
  });

  it('should display error when loading fails', async () => {
    (taskService.getTasks as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });
  });

  it('should show retry button when error occurs', async () => {
    (taskService.getTasks as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should show task count when tasks are loaded', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Showing 2 tasks')).toBeInTheDocument();
    });
  });

  it('should show singular task count when only one task', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([mockTasks[0]]);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Showing 1 task')).toBeInTheDocument();
    });
  });

  it('should open create modal when New Task button is clicked', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    const newTaskButton = screen.getByText('New Task');
    fireEvent.click(newTaskButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument();
    });
  });

  it('should open view modal when View button is clicked', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const viewButton = screen.getByLabelText('View Task 1');
    fireEvent.click(viewButton);
    
    await waitFor(() => {
      expect(screen.getByText('Task Details')).toBeInTheDocument();
    });
  });

  it('should open edit modal when Edit button is clicked', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const editButton = screen.getByLabelText('Edit Task 1');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
  });

  it('should open delete confirmation modal when Delete button is clicked', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByLabelText('Delete Task 1');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete Task')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const viewButton = screen.getByLabelText('View Task 1');
    fireEvent.click(viewButton);
    
    await waitFor(() => {
      expect(screen.getByText('Task Details')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Task Details')).not.toBeInTheDocument();
    });
  });

  it('should close delete modal when Cancel is clicked', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByLabelText('Delete Task 1');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete Task')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Delete Task')).not.toBeInTheDocument();
    });
  });

  it('should call deleteTask and refresh list when delete is confirmed', async () => {
    (taskService.getTasks as jest.Mock)
      .mockResolvedValueOnce(mockTasks)
      .mockResolvedValueOnce([]);
    (taskService.deleteTask as jest.Mock).mockResolvedValue(undefined);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Delete Task 1');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Delete Task')).toBeInTheDocument();
    });

    // Get the delete confirm button from the modal (it's the danger button)
    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(taskService.deleteTask).toHaveBeenCalledWith('task-1');
    });
  });

  // ==================== Search Functionality Tests ====================

  it('test_search_integration - Search filters tasks', async () => {
    const getTasksMock = jest.fn().mockResolvedValue(mockTasks);
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for "Task 1"
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'Task 1' } });

    // Wait for debounce and API call
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Task 1' })
      );
    });
  });

  it('test_search_no_results - Shows "no results" message', async () => {
    // Return empty array for search results
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Wait for the no results message
    await waitFor(() => {
      expect(
        screen.getByText(/No tasks found matching "nonexistent"/i)
      ).toBeInTheDocument();
    });
  });

  it('test_search_with_other_filters - Search + status + sort work together', async () => {
    const getTasksMock = jest.fn().mockResolvedValue(mockTasks);
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'urgent' } });

    // Change status filter
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'pending' } });

    // Change sort
    const sortSelect = screen.getByLabelText('Sort By');
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    // Wait for API calls with all filters
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'urgent',
          status: 'pending',
          sortBy: 'title',
        })
      );
    });
  });

  it('test_search_results_count - Shows count of filtered results', async () => {
    const filteredTasks = [mockTasks[0]]; // Only one task matches
    (taskService.getTasks as jest.Mock).mockResolvedValue(filteredTasks);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'Task 1' } });

    // Wait for results and check count with search query
    await waitFor(() => {
      expect(screen.getByText(/Showing 1 task matching "Task 1"/i)).toBeInTheDocument();
    });
  });

  it('should show clear search button when search has results', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue([]);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for clear search button to appear
    await waitFor(() => {
      expect(screen.getByText('Clear search')).toBeInTheDocument();
    });
  });

  it('should clear search when clear search button is clicked', async () => {
    const getTasksMock = jest.fn().mockResolvedValue([]); // Return empty to show clear button
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for clear search button to appear in empty state
    await waitFor(() => {
      expect(screen.getByText('Clear search')).toBeInTheDocument();
    });

    // Click clear search button
    const clearButton = screen.getByText('Clear search');
    fireEvent.click(clearButton);

    // Search should be cleared - input value should be empty
    expect(searchInput).toHaveValue('');
  });

  it('should call getTasks with search parameter', async () => {
    const getTasksMock = jest.fn().mockResolvedValue(mockTasks);
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'work' } });

    // Wait for API call with search parameter
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'work' })
      );
    });
  });

  it('should update results when search query changes', async () => {
    const getTasksMock = jest.fn()
      .mockResolvedValueOnce(mockTasks)
      .mockResolvedValueOnce([mockTasks[0]])
      .mockResolvedValueOnce([]);
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');

    // First search
    fireEvent.change(searchInput, { target: { value: 'Task' } });
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Task' })
      );
    });

    // Second search
    fireEvent.change(searchInput, { target: { value: 'Task 1' } });
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Task 1' })
      );
    });

    // Third search - no results
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'nonexistent' })
      );
    });
  });

  it('should preserve search when changing other filters', async () => {
    const getTasksMock = jest.fn().mockResolvedValue(mockTasks);
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'important' } });

    // Wait for first call with search
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'important' })
      );
    });

    // Change status filter while keeping search
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    // Should call with both search and status
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'important',
          status: 'completed',
        })
      );
    });
  });

  it('should show search query in results count', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'my search' } });

    // Wait for results count with search query
    await waitFor(() => {
      expect(screen.getByText(/matching "my search"/i)).toBeInTheDocument();
    });
  });

  it('should handle empty search correctly', async () => {
    const getTasksMock = jest.fn().mockResolvedValue(mockTasks);
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Empty search should still call getTasks
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: '' } });

    // Should call without search parameter or with empty string
    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalled();
    });
  });

  it('should handle special characters in search', async () => {
    const getTasksMock = jest.fn().mockResolvedValue(mockTasks);
    (taskService.getTasks as jest.Mock).mockImplementation(getTasksMock);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    });

    // Search with special characters
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: "test's <special>" } });

    await waitFor(() => {
      expect(getTasksMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: "test's <special>" })
      );
    });
  });
});
