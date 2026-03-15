/**
 * DeleteConfirmModal Component Tests
 */
import { render, screen, fireEvent, waitFor } from '../utils/render';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  it('should not render when isOpen is false', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirmModal isOpen={false} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
  });

  it('should display task title when provided', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        taskTitle="Test Task"
      />
    );

    expect(screen.getByText('"Test Task"')).toBeInTheDocument();
  });

  it('should display warning message', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onConfirm when delete button is clicked', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(<DeleteConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    const modalDialog = screen.getByRole('alertdialog');
    fireEvent.click(modalDialog);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show loading state when isLoading is true', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        isLoading={true}
      />
    );

    const cancelButton = screen.getByText('Cancel') as HTMLButtonElement;
    expect(cancelButton).toBeDisabled();

    const deleteButton = screen.getByText('Deleting...') as HTMLButtonElement;
    expect(deleteButton).toBeDisabled();

    // Check for spinner element
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should disable close button when isLoading is true', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        isLoading={true}
      />
    );

    const closeButton = screen.getByLabelText('Close') as HTMLButtonElement;
    expect(closeButton).toBeDisabled();
  });

  it('should display error message when provided', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        error="Failed to delete task"
      />
    );

    expect(screen.getByText('Failed to delete task')).toBeInTheDocument();
  });

  it('should not close when backdrop is clicked during loading', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        isLoading={true}
      />
    );

    const modalDialog = screen.getByRole('alertdialog');
    fireEvent.click(modalDialog);

    expect(onClose).not.toHaveBeenCalled();
  });
});
