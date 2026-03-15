/**
 * Toast Component and Context Tests
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Toast from '@/components/Toast';
import { ToastProvider, useToast } from '@/context/ToastContext';

// Test component that uses the toast hook
function TestComponent() {
  const { success, error, warning, info, addToast, removeToast } = useToast();
  
  return (
    <div>
      <button onClick={() => success('Success message')} data-testid="success-btn">
        Show Success
      </button>
      <button onClick={() => error('Error message')} data-testid="error-btn">
        Show Error
      </button>
      <button onClick={() => warning('Warning message')} data-testid="warning-btn">
        Show Warning
      </button>
      <button onClick={() => info('Info message')} data-testid="info-btn">
        Show Info
      </button>
      <button onClick={() => addToast('Custom toast', 'info', 1000)} data-testid="custom-btn">
        Show Custom
      </button>
      <button onClick={() => removeToast('test-id')} data-testid="remove-btn">
        Remove Toast
      </button>
    </div>
  );
}

// Wrapper component for toast tests
function ToastTestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toast position="top-right" />
    </ToastProvider>
  );
}

// Custom render for toast tests (without default providers)
function renderToast(ui: React.ReactElement, options?: Parameters<typeof render>[1]) {
  return render(ui, options);
}

describe('ToastContext', () => {
  it('should provide toast context', () => {
    renderToast(
      <ToastProvider>
        <div data-testid="content">Content</div>
        <Toast />
      </ToastProvider>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should add toast to the list', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const successBtn = screen.getByTestId('success-btn');
    fireEvent.click(successBtn);

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should show error toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const errorBtn = screen.getByTestId('error-btn');
    fireEvent.click(errorBtn);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByTestId('toast-error')).toBeInTheDocument();
  });

  it('should show warning toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const warningBtn = screen.getByTestId('warning-btn');
    fireEvent.click(warningBtn);

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
  });

  it('should show info toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const infoBtn = screen.getByTestId('info-btn');
    fireEvent.click(infoBtn);

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByTestId('toast-info')).toBeInTheDocument();
  });

  it('should auto-dismiss toast after duration', async () => {
    jest.useFakeTimers();
    
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const customBtn = screen.getByTestId('custom-btn');
    fireEvent.click(customBtn);

    expect(screen.getByText('Custom toast')).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(screen.queryByText('Custom toast')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should manually dismiss toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const successBtn = screen.getByTestId('success-btn');
    fireEvent.click(successBtn);

    const dismissBtn = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissBtn);

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('should show multiple toasts', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const successBtn = screen.getByTestId('success-btn');
    const errorBtn = screen.getByTestId('error-btn');
    
    fireEvent.click(successBtn);
    fireEvent.click(errorBtn);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should have correct alert class for success toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const successBtn = screen.getByTestId('success-btn');
    fireEvent.click(successBtn);

    const toast = screen.getByTestId('toast-success');
    expect(toast).toHaveClass('alert-success');
  });

  it('should have correct alert class for error toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const errorBtn = screen.getByTestId('error-btn');
    fireEvent.click(errorBtn);

    const toast = screen.getByTestId('toast-error');
    expect(toast).toHaveClass('alert-danger');
  });

  it('should have correct alert class for warning toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const warningBtn = screen.getByTestId('warning-btn');
    fireEvent.click(warningBtn);

    const toast = screen.getByTestId('toast-warning');
    expect(toast).toHaveClass('alert-warning');
  });

  it('should have correct alert class for info toast', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const infoBtn = screen.getByTestId('info-btn');
    fireEvent.click(infoBtn);

    const toast = screen.getByTestId('toast-info');
    expect(toast).toHaveClass('alert-info');
  });

  it('should have dismiss button with correct aria label', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const successBtn = screen.getByTestId('success-btn');
    fireEvent.click(successBtn);

    const dismissBtn = screen.getByLabelText('Dismiss notification');
    expect(dismissBtn).toBeInTheDocument();
    expect(dismissBtn).toHaveAttribute('data-bs-dismiss', 'alert');
  });

  it('should have correct icons for different toast types', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    // Success toast
    fireEvent.click(screen.getByTestId('success-btn'));
    expect(screen.getByText('✓')).toBeInTheDocument();

    // Error toast
    fireEvent.click(screen.getByTestId('error-btn'));
    expect(screen.getAllByText('✕')).toHaveLength(1);
  });

  it('should have toast container with correct position classes', () => {
    renderToast(
      <ToastProvider>
        <TestComponent />
        <Toast position="top-right" />
      </ToastProvider>
    );

    const successBtn = screen.getByTestId('success-btn');
    fireEvent.click(successBtn);

    const container = screen.getByTestId('toast-container');
    expect(container).toHaveClass('position-fixed', 'top-0', 'end-0', 'p-3');
  });

  it('should have proper ARIA attributes', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const successBtn = screen.getByTestId('success-btn');
    fireEvent.click(successBtn);

    const toast = screen.getByTestId('toast-success');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('should have error toast with assertive aria-live', () => {
    renderToast(
      <ToastTestWrapper>
        <TestComponent />
      </ToastTestWrapper>
    );

    const errorBtn = screen.getByTestId('error-btn');
    fireEvent.click(errorBtn);

    const toast = screen.getByTestId('toast-error');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });
});

describe('useToast hook', () => {
  it('should throw error when used outside ToastProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderToast(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleSpy.mockRestore();
  });
});
