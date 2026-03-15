/**
 * TaskSearch Component Tests
 *
 * Comprehensive tests for TaskSearch component including:
 * - Basic rendering and functionality
 * - Debounced search behavior (300ms delay)
 * - Clear button functionality
 * - Accessibility features
 * - Integration with filters
 */
import { render, screen, fireEvent, waitFor, act } from '../utils/render';
import { TaskSearch } from '@/components/TaskSearch';

// Mock timers for debounce testing
jest.useFakeTimers();

describe('TaskSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // ==================== Basic Rendering Tests ====================

  it('test_render_search_input - Input renders with correct placeholder', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toBeInTheDocument();
  });

  it('test_search_icon - Search icon is visible', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    // Check for search icon (SVG)
    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toHaveClass('bi-search');
  });

  it('test_clear_button_hidden_when_empty - Clear button hidden when no text', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const clearButton = screen.queryByTestId('clear-button');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('test_clear_button_visible_when_typing - Clear button shows when typing', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="some text" onSearchChange={onSearchChange} />);

    const clearButton = screen.getByTestId('clear-button');
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
  });

  // ==================== Input Behavior Tests ====================

  it('test_search_typing_updates_value - Typing updates input', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('test search');
    });
  });

  it('should update input value when value prop changes', () => {
    const onSearchChange = jest.fn();
    const { rerender } = render(<TaskSearch value="initial" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toHaveValue('initial');

    rerender(<TaskSearch value="updated" onSearchChange={onSearchChange} />);
    expect(searchInput).toHaveValue('updated');
  });

  // ==================== Debounce Tests ====================

  it('test_search_debounced - Search waits 300ms before firing onChange', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');

    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // onChange should NOT be called immediately (debounced)
    expect(onSearchChange).not.toHaveBeenCalled();

    // Fast-forward 299ms (just before debounce threshold)
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(onSearchChange).not.toHaveBeenCalled();

    // Fast-forward remaining 1ms to reach 300ms threshold
    act(() => {
      jest.advanceTimersByTime(1);
    });

    // Now onChange should be called
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });
  });

  it('should debounce multiple rapid keystrokes', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');

    // Type multiple characters rapidly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should not have been called yet
    expect(onSearchChange).not.toHaveBeenCalled();

    // Wait for debounce period
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should only be called once with the final value
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });
  });

  it('should reset debounce timer on new input', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');

    // First input
    fireEvent.change(searchInput, { target: { value: 'first' } });

    // Wait 200ms (before debounce completes)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Second input before debounce completes
    fireEvent.change(searchInput, { target: { value: 'second' } });

    // Should not have been called yet
    expect(onSearchChange).not.toHaveBeenCalled();

    // Wait for debounce period from second input
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should be called with the latest value only
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('second');
    });
  });

  // ==================== Clear Button Tests ====================

  it('test_clear_button_clears_search - Clear button resets input', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="some text" onSearchChange={onSearchChange} />);

    const clearButton = screen.getByTestId('clear-button');
    fireEvent.click(clearButton);

    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('should hide clear button after clearing', () => {
    const onSearchChange = jest.fn();
    const { rerender } = render(<TaskSearch value="some text" onSearchChange={onSearchChange} />);

    // Clear button should be visible
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();

    // Simulate clearing
    rerender(<TaskSearch value="" onSearchChange={onSearchChange} />);

    // Clear button should be hidden
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('should clear search on Escape key press', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="test search" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' });

    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  // ==================== Case Insensitivity Tests ====================

  it('test_search_case_insensitive - Works with any case', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');

    // Test uppercase
    fireEvent.change(searchInput, { target: { value: 'TEST SEARCH' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onSearchChange).toHaveBeenCalledWith('TEST SEARCH');

    // Test mixed case
    fireEvent.change(searchInput, { target: { value: 'TeSt SeArCh' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onSearchChange).toHaveBeenCalledWith('TeSt SeArCh');

    // Test lowercase
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onSearchChange).toHaveBeenCalledWith('test search');
  });

  // ==================== Special Character Tests ====================

  it('should handle special characters in search', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: "test's <special> & chars" } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith("test's <special> & chars");
    });
  });

  it('should handle unicode characters in search', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: '你好 世界 🌍' } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('你好 世界 🌍');
    });
  });

  it('should handle long search queries', async () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    const longQuery = 'a'.repeat(500);
    fireEvent.change(searchInput, { target: { value: longQuery } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith(longQuery);
    });
  });

  // ==================== Accessibility Tests ====================

  it('test_accessible - Has ARIA labels', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByLabelText('Search tasks by title or description');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('aria-describedby');
  });

  it('should have proper input type', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toHaveAttribute('type', 'search');
  });

  it('should have search help text for screen readers', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} />);

    // Check for visually hidden help text
    const helpText = screen.getByText(/Type to search tasks/i);
    expect(helpText).toHaveClass('visually-hidden');
  });

  // ==================== Custom Props Tests ====================

  it('should apply custom className when provided', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} className="custom-class" />);

    const container = screen.getByTestId('search-icon').closest('.input-group');
    expect(container).toHaveClass('custom-class');
  });

  it('should use custom placeholder when provided', () => {
    const onSearchChange = jest.fn();
    const customPlaceholder = 'Custom search placeholder...';
    render(
      <TaskSearch
        value=""
        onSearchChange={onSearchChange}
        placeholder={customPlaceholder}
      />
    );

    const searchInput = screen.getByPlaceholderText(customPlaceholder);
    expect(searchInput).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const onSearchChange = jest.fn();
    render(<TaskSearch value="" onSearchChange={onSearchChange} disabled />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toBeDisabled();
  });

  // ==================== Integration Tests ====================

  it('test_search_combined_with_filters - Works with status filter', async () => {
    const onSearchChange = jest.fn();
    const { container } = render(
      <div>
        <TaskSearch value="test" onSearchChange={onSearchChange} />
        <select data-testid="status-filter">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    );

    // Verify both elements are rendered
    expect(screen.getByPlaceholderText('Search tasks by title or description...')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();

    // Test search functionality alongside filter
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    fireEvent.change(searchInput, { target: { value: 'new search' } });

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('new search');
    });
  });

  it('should maintain value when component re-renders', () => {
    const onSearchChange = jest.fn();
    const { rerender } = render(<TaskSearch value="persistent" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...');
    expect(searchInput).toHaveValue('persistent');

    // Re-render with same value
    rerender(<TaskSearch value="persistent" onSearchChange={onSearchChange} />);
    expect(searchInput).toHaveValue('persistent');
  });
});
