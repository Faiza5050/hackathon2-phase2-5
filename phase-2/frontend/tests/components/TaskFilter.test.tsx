/**
 * TaskFilter Component Tests
 *
 * Tests for TaskFilter component including:
 * - Basic rendering and functionality
 * - Search component integration
 * - Status filter functionality
 * - Sort functionality
 * - Combined filter tests
 */
import { render, screen, fireEvent, waitFor, act } from '../utils/render';
import { TaskFilter } from '@/components/TaskFilter';

// Mock timers for debounce testing
jest.useFakeTimers();

describe('TaskFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // ==================== Basic Rendering Tests ====================

  it('should render TaskFilter component', () => {
    render(<TaskFilter />);

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    expect(screen.getByLabelText('Order')).toBeInTheDocument();
  });

  it('test_search_component_renders - TaskSearch is included', () => {
    render(<TaskFilter />);

    // Check for search input from TaskSearch component
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toBeInTheDocument();

    // Check for search icon
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('should render status filter with all options', () => {
    render(<TaskFilter />);

    const statusSelect = screen.getByLabelText('Status');
    expect(statusSelect).toBeInTheDocument();

    // Check all status options
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render sort by filter with all options', () => {
    render(<TaskFilter />);

    const sortSelect = screen.getByLabelText('Sort By');
    expect(sortSelect).toBeInTheDocument();

    // Check all sort options within the sort select
    expect(sortSelect).toContainHTML('<option value="created_at">Created Date</option>');
    expect(sortSelect).toContainHTML('<option value="due_date">Due Date</option>');
    expect(sortSelect).toContainHTML('<option value="title">Title</option>');
    expect(sortSelect).toContainHTML('<option value="status">Status</option>');
  });

  it('should render order filter with all options', () => {
    render(<TaskFilter />);

    const orderSelect = screen.getByLabelText('Order');
    expect(orderSelect).toBeInTheDocument();

    // Check all order options
    expect(screen.getByText('Newest First')).toBeInTheDocument();
    expect(screen.getByText('Oldest First')).toBeInTheDocument();
  });

  // ==================== Status Filter Tests ====================

  it('should call onStatusChange when status changes', () => {
    const onStatusChange = jest.fn();
    render(<TaskFilter onStatusChange={onStatusChange} />);

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'pending' } });

    expect(onStatusChange).toHaveBeenCalledWith('pending');
  });

  it('should display current status value', () => {
    render(<TaskFilter status="completed" />);

    const statusSelect = screen.getByLabelText('Status');
    expect(statusSelect).toHaveValue('completed');
  });

  // ==================== Sort Filter Tests ====================

  it('should call onSortByChange when sort changes', () => {
    const onSortByChange = jest.fn();
    render(<TaskFilter onSortByChange={onSortByChange} />);

    const sortSelect = screen.getByLabelText('Sort By');
    fireEvent.change(sortSelect, { target: { value: 'due_date' } });

    expect(onSortByChange).toHaveBeenCalledWith('due_date');
  });

  it('should display current sort value', () => {
    render(<TaskFilter sortBy="title" />);

    const sortSelect = screen.getByLabelText('Sort By');
    expect(sortSelect).toHaveValue('title');
  });

  // ==================== Order Filter Tests ====================

  it('should call onOrderChange when order changes', () => {
    const onOrderChange = jest.fn();
    render(<TaskFilter onOrderChange={onOrderChange} />);

    const orderSelect = screen.getByLabelText('Order');
    fireEvent.change(orderSelect, { target: { value: 'asc' } });

    expect(onOrderChange).toHaveBeenCalledWith('asc');
  });

  it('should display current order value', () => {
    render(<TaskFilter order="asc" />);

    const orderSelect = screen.getByLabelText('Order');
    expect(orderSelect).toHaveValue('asc');
  });

  // ==================== Search Integration Tests ====================

  it('test_search_and_status_filter_combined - Both work together', async () => {
    const onSearchChange = jest.fn();
    const onStatusChange = jest.fn();
    render(
      <TaskFilter
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Change status
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'pending' } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledWith('test');
    expect(onStatusChange).toHaveBeenCalledWith('pending');
  });

  it('test_search_and_sort_combined - Search + sort work together', async () => {
    const onSearchChange = jest.fn();
    const onSortByChange = jest.fn();
    render(
      <TaskFilter
        onSearchChange={onSearchChange}
        onSortByChange={onSortByChange}
      />
    );

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'urgent' } });

    // Change sort
    const sortSelect = screen.getByLabelText('Sort By');
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledWith('urgent');
    expect(onSortByChange).toHaveBeenCalledWith('title');
  });

  it('should handle all filters changing together', async () => {
    const onSearchChange = jest.fn();
    const onStatusChange = jest.fn();
    const onSortByChange = jest.fn();
    const onOrderChange = jest.fn();

    render(
      <TaskFilter
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onSortByChange={onSortByChange}
        onOrderChange={onOrderChange}
      />
    );

    // Change all filters
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'work' } });

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });

    const sortSelect = screen.getByLabelText('Sort By');
    fireEvent.change(sortSelect, { target: { value: 'due_date' } });

    const orderSelect = screen.getByLabelText('Order');
    fireEvent.change(orderSelect, { target: { value: 'asc' } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // All callbacks should be called
    expect(onSearchChange).toHaveBeenCalledWith('work');
    expect(onStatusChange).toHaveBeenCalledWith('in_progress');
    expect(onSortByChange).toHaveBeenCalledWith('due_date');
    expect(onOrderChange).toHaveBeenCalledWith('asc');
  });

  // ==================== Search Debounce Tests ====================

  it('should debounce search input in TaskFilter', async () => {
    const onSearchChange = jest.fn();
    render(<TaskFilter onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should not be called immediately
    expect(onSearchChange).not.toHaveBeenCalled();

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  // ==================== Controlled Component Tests ====================

  it('should display search value from props', () => {
    render(<TaskFilter search="existing search" />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toHaveValue('existing search');
  });

  it('should update when search prop changes', () => {
    const { rerender } = render(<TaskFilter search="initial" />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toHaveValue('initial');

    rerender(<TaskFilter search="updated" />);
    expect(searchInput).toHaveValue('updated');
  });

  // ==================== Custom Class Name Tests ====================

  it('should apply custom className when provided', () => {
    render(<TaskFilter className="custom-filter-class" />);

    const container = screen.getByLabelText('Search').closest('.task-filter');
    expect(container).toHaveClass('custom-filter-class');
  });

  // ==================== Default Props Tests ====================

  it('should use default values when props not provided', () => {
    render(<TaskFilter />);

    expect(screen.getByLabelText('Status')).toHaveValue('all');
    expect(screen.getByLabelText('Sort By')).toHaveValue('created_at');
    expect(screen.getByLabelText('Order')).toHaveValue('desc');
    expect(screen.getByPlaceholderText('Search tasks by title or description...')).toHaveValue('');
  });

  // ==================== Responsive Layout Tests ====================

  it('should have responsive grid layout', () => {
    render(<TaskFilter />);

    // Check for Bootstrap responsive classes
    const container = screen.getByLabelText('Search').closest('.task-filter');
    expect(container).toBeInTheDocument();

    // Check for row class
    const row = container?.querySelector('.row');
    expect(row).toBeInTheDocument();
  });

  // ==================== Accessibility Tests ====================

  it('should have proper labels for all inputs', () => {
    render(<TaskFilter />);

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    expect(screen.getByLabelText('Order')).toBeInTheDocument();
  });

  it('should have proper IDs for all inputs', () => {
    render(<TaskFilter />);

    expect(screen.getByLabelText('Search')).toHaveAttribute('id');
    expect(screen.getByLabelText('Status')).toHaveAttribute('id', 'filter-status');
    expect(screen.getByLabelText('Sort By')).toHaveAttribute('id', 'filter-sort');
    expect(screen.getByLabelText('Order')).toHaveAttribute('id', 'filter-order');
  });

  // ==================== Edge Cases ====================

  it('should handle empty search gracefully', async () => {
    const onSearchChange = jest.fn();
    render(<TaskFilter onSearchChange={onSearchChange} search="initial" />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    
    // Clear the search
    fireEvent.change(searchInput, { target: { value: '' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('should handle special characters in search', async () => {
    const onSearchChange = jest.fn();
    render(<TaskFilter onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: "test's <special> & chars" } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledWith("test's <special> & chars");
  });

  it('should handle rapid filter changes', () => {
    const onStatusChange = jest.fn();
    render(<TaskFilter onStatusChange={onStatusChange} />);

    const statusSelect = screen.getByLabelText('Status');

    // Rapid changes
    fireEvent.change(statusSelect, { target: { value: 'pending' } });
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    // All changes should be registered
    expect(onStatusChange).toHaveBeenCalledTimes(3);
    expect(onStatusChange).toHaveBeenLastCalledWith('completed');
  });
});
