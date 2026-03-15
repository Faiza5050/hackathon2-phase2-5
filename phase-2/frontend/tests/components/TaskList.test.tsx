/**
 * TaskList Component Tests
 */
import { render, screen } from '../utils/render';
import { TaskList } from '@/components/TaskList';
import type { Task } from '@/types/task';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Task 1',
    description: 'First task description',
    status: 'pending',
    due_date: '2026-04-01T00:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'task-2',
    user_id: 'user-1',
    title: 'Task 2',
    description: 'Second task description',
    status: 'completed',
    due_date: '2026-04-15T00:00:00Z',
    created_at: '2026-03-05T00:00:00Z',
  },
];

describe('TaskList', () => {
  it('should render loading state when isLoading is true', () => {
    render(<TaskList tasks={[]} isLoading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render empty state when tasks array is empty', () => {
    render(<TaskList tasks={[]} />);
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first task!')).toBeInTheDocument();
  });

  it('should render empty state when tasks is null', () => {
    render(<TaskList tasks={null as unknown as Task[]} />);
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('should render tasks in a table', () => {
    render(<TaskList tasks={mockTasks} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('First task description')).toBeInTheDocument();
    expect(screen.getByText('Second task description')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<TaskList tasks={mockTasks} />);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render status badges for each task', () => {
    render(<TaskList tasks={mockTasks} />);
    
    expect(screen.getAllByText('Pending')).toHaveLength(1);
    expect(screen.getAllByText('Completed')).toHaveLength(1);
  });

  it('should render action buttons for each task', () => {
    const onView = jest.fn();
    render(<TaskList tasks={mockTasks} onView={onView} />);

    const viewButtons = screen.getAllByLabelText(/View/);
    expect(viewButtons).toHaveLength(2);
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<TaskList tasks={mockTasks} onEdit={onEdit} />);
    
    const editButton = screen.getByLabelText('Edit Task 1');
    editButton.click();
    
    expect(onEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<TaskList tasks={mockTasks} onDelete={onDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete Task 1');
    deleteButton.click();
    
    expect(onDelete).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should call onView when view button is clicked', () => {
    const onView = jest.fn();
    render(<TaskList tasks={mockTasks} onView={onView} />);
    
    const viewButton = screen.getByLabelText('View Task 1');
    viewButton.click();
    
    expect(onView).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<TaskList tasks={mockTasks} className="custom-class" />);

    expect(container.querySelector('.task-list')).toHaveClass('custom-class');
  });

  it('should render due dates correctly', () => {
    render(<TaskList tasks={mockTasks} />);
    
    expect(screen.getByText('4/1/2026')).toBeInTheDocument();
    expect(screen.getByText('4/15/2026')).toBeInTheDocument();
  });

  it('should render created dates correctly', () => {
    render(<TaskList tasks={mockTasks} />);
    
    expect(screen.getByText('3/1/2026')).toBeInTheDocument();
    expect(screen.getByText('3/5/2026')).toBeInTheDocument();
  });
});
