/**
 * TaskForm Component Tests
 */
import { render, screen, fireEvent, waitFor } from '../utils/render';
import { TaskForm } from '@/components/TaskForm';
import type { Task } from '@/types/task';

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending',
  due_date: '2026-04-01T00:00:00Z',
  created_at: '2026-03-01T00:00:00Z',
};

describe('TaskForm', () => {
  it('should render form fields in create mode', () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('should render form fields in edit mode with task data', () => {
    const onSubmit = jest.fn();
    render(<TaskForm task={mockTask} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/Title/)).toHaveValue('Test Task');
    expect(screen.getByLabelText(/Description/)).toHaveValue('Test description');
    expect(screen.getByLabelText(/Status/)).toHaveValue('pending');
    expect(screen.getByLabelText(/Due Date/)).toHaveValue('2026-04-01');
    expect(screen.getByText('Update Task')).toBeInTheDocument();
  });

  it('should show cancel button when onCancel is provided', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should not show cancel button when onCancel is not provided', () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('should validate required title field', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(/Title/);
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should validate title length', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(/Title/);
    fireEvent.change(titleInput, { target: { value: 'a'.repeat(201) } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title must be less than 200 characters')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should validate description length', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    const descInput = screen.getByLabelText(/Description/);
    fireEvent.change(descInput, { target: { value: 'a'.repeat(1001) } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Description must be less than 1000 characters')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should clear field errors when user starts typing', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(/Title/) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  it('should call onSubmit with correct data on valid submit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'New description' } });
    fireEvent.change(screen.getByLabelText(/Status/), { target: { value: 'in_progress' } });
    fireEvent.change(screen.getByLabelText(/Due Date/), { target: { value: '2026-05-01' } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New description',
        status: 'in_progress',
        due_date: '2026-05-01',
      });
    });
  });

  it('should handle null due_date when not provided', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'New Task' } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          due_date: null,
        })
      );
    });
  });

  it('should display submit error when onSubmit throws', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Failed to create task'));
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'New Task' } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument();
    });
  });

  it('should display external error when provided', () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} error="External error message" />);

    expect(screen.getByText('External error message')).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} isLoading={true} />);

    const titleInput = screen.getByLabelText(/Title/) as HTMLInputElement;
    expect(titleInput).toBeDisabled();

    const submitButton = screen.getByText(/Creating\.\.\./);
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should show updating text when isLoading and edit mode', () => {
    const onSubmit = jest.fn();
    render(<TaskForm task={mockTask} onSubmit={onSubmit} isLoading={true} />);

    expect(screen.getByText(/Updating\.\.\./)).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show character count for description', () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    const descInput = screen.getByLabelText(/Description/) as HTMLTextAreaElement;
    fireEvent.change(descInput, { target: { value: 'Hello' } });

    expect(screen.getByText('5/1000 characters')).toBeInTheDocument();
  });

  it('should trim title and description before submitting', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: '  Trimmed Title  ' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: '  Trimmed description  ' } });

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Trimmed Title',
        description: 'Trimmed description',
        status: 'pending',
        due_date: null,
      });
    });
  });
});
