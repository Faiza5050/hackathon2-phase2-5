/**
 * TaskItem Component Tests
 */
import { render, screen, fireEvent } from '../utils/render';
import { TaskItem } from '@/components/TaskItem';
import type { Task } from '@/types/task';

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  title: 'Test Task',
  description: 'This is a test task description',
  status: 'pending',
  due_date: '2026-04-01T00:00:00Z',
  created_at: '2026-03-01T00:00:00Z',
};

const overdueTask: Task = {
  ...mockTask,
  id: 'task-2',
  title: 'Overdue Task',
  due_date: '2026-01-01T00:00:00Z',
  status: 'pending',
};

describe('TaskItem', () => {
  it('should render task title and description', () => {
    render(<TaskItem task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText(/This is a test task description/)).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<TaskItem task={mockTask} />);
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render due date', () => {
    render(<TaskItem task={mockTask} />);
    
    expect(screen.getByText('4/1/2026')).toBeInTheDocument();
  });

  it('should render created date on large screens', () => {
    render(<TaskItem task={mockTask} />);
    
    expect(screen.getByText('3/1/2026')).toBeInTheDocument();
  });

  it('should highlight overdue tasks', () => {
    render(<TaskItem task={overdueTask} />);
    
    const row = screen.getByRole('row');
    expect(row).toHaveClass('table-danger');
    expect(screen.getByText('Overdue Task')).toHaveClass('text-danger');
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<TaskItem task={mockTask} onEdit={onEdit} />);
    
    const editButton = screen.getByLabelText('Edit Test Task');
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<TaskItem task={mockTask} onDelete={onDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete Test Task');
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith(mockTask);
  });

  it('should call onView when row is clicked', () => {
    const onView = jest.fn();
    render(<TaskItem task={mockTask} onView={onView} />);
    
    const row = screen.getByRole('row');
    fireEvent.click(row);
    
    expect(onView).toHaveBeenCalledWith(mockTask);
  });

  it('should call onView when Enter key is pressed', () => {
    const onView = jest.fn();
    render(<TaskItem task={mockTask} onView={onView} />);
    
    const row = screen.getByRole('row');
    fireEvent.keyDown(row, { key: 'Enter' });
    
    expect(onView).toHaveBeenCalledWith(mockTask);
  });

  it('should call onView when Space key is pressed', () => {
    const onView = jest.fn();
    render(<TaskItem task={mockTask} onView={onView} />);
    
    const row = screen.getByRole('row');
    fireEvent.keyDown(row, { key: ' ' });
    
    expect(onView).toHaveBeenCalledWith(mockTask);
  });

  it('should not render action buttons when handlers are not provided', () => {
    render(<TaskItem task={mockTask} />);
    
    expect(screen.queryByLabelText('Edit Test Task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete Test Task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('View Test Task')).not.toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    render(<TaskItem task={mockTask} className="custom-class" />);
    
    const row = screen.getByRole('row');
    expect(row).toHaveClass('custom-class');
  });

  it('should truncate long descriptions', () => {
    const longDescriptionTask: Task = {
      ...mockTask,
      description: 'This is a very long description that should be truncated when displayed in the task list',
    };

    render(<TaskItem task={longDescriptionTask} />);

    // Description is truncated - check for partial text with ellipsis
    expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
  });
});
