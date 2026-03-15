/**
 * TaskModal Component Tests
 */
import { render, screen, fireEvent } from '../utils/render';
import { TaskModal } from '@/components/TaskModal';
import type { Task } from '@/types/task';

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  title: 'Test Task',
  description: 'Test description for the task',
  status: 'pending',
  due_date: '2026-04-01T00:00:00Z',
  created_at: '2026-03-01T00:00:00Z',
};

describe('TaskModal', () => {
  it('should not render when isOpen is false', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={false} onClose={onClose} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Task Details')).toBeInTheDocument();
  });

  it('should display task title in view mode', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should display task description in view mode', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    expect(screen.getByText('Test description for the task')).toBeInTheDocument();
  });

  it('should display status badge in view mode', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    expect(screen.getAllByText('Pending')).toHaveLength(2);
  });

  it('should display formatted due date in view mode', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    expect(screen.getByText('April 1, 2026')).toBeInTheDocument();
  });

  it('should display "Not set" for null due date', () => {
    const onClose = jest.fn();
    const taskWithoutDueDate: Task = {
      ...mockTask,
      due_date: null,
    };
    render(<TaskModal isOpen={true} onClose={onClose} task={taskWithoutDueDate} />);

    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('should display "No description provided" for empty description', () => {
    const onClose = jest.fn();
    const taskWithoutDesc: Task = {
      ...mockTask,
      description: '',
    };
    render(<TaskModal isOpen={true} onClose={onClose} task={taskWithoutDesc} />);

    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    const modalDialog = screen.getByRole('dialog');
    fireEvent.click(modalDialog);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('should render form in edit mode', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();
    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        task={mockTask}
        onSubmit={onSubmit}
        mode="edit"
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toHaveValue('Test Task');
  });

  it('should render create form when no task in edit mode', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();
    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        mode="edit"
      />
    );

    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true in view mode', () => {
    const onClose = jest.fn();
    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        task={mockTask}
        isLoading={true}
      />
    );

    const closeButton = screen.getByText('Close') as HTMLButtonElement;
    expect(closeButton).toBeDisabled();
    const closeIcon = screen.getByLabelText('Close') as HTMLButtonElement;
    expect(closeIcon).toBeDisabled();
  });

  it('should display error when provided', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();
    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        task={mockTask}
        onSubmit={onSubmit}
        mode="edit"
        error="Test error message"
      />
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should display created date', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    expect(screen.getByText('March 1, 2026')).toBeInTheDocument();
  });

  it('should not display updated_at section when not provided', () => {
    const onClose = jest.fn();
    render(<TaskModal isOpen={true} onClose={onClose} task={mockTask} />);

    expect(screen.queryByText('Last Updated')).not.toBeInTheDocument();
  });

  it('should display updated_at when provided', () => {
    const onClose = jest.fn();
    const taskWithUpdate: Task = {
      ...mockTask,
      updated_at: '2026-03-15T00:00:00Z',
    };
    render(<TaskModal isOpen={true} onClose={onClose} task={taskWithUpdate} />);

    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('March 15, 2026')).toBeInTheDocument();
  });
});
