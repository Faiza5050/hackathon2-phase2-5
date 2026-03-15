/**
 * Tests for DashboardError component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardError } from '@/components/DashboardError';

describe('DashboardError', () => {
  it('test_render_error_message - Shows error message', () => {
    const errorMessage = 'Failed to connect to server';
    render(<DashboardError message={errorMessage} />);

    // Check that the error container is rendered
    const errorContainer = screen.getByTestId('dashboard-error');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveClass('alert');
    expect(errorContainer).toHaveClass('alert-danger');

    // Check for error icon
    const icon = errorContainer.querySelector('.bi-exclamation-triangle-fill');
    expect(icon).toBeInTheDocument();

    // Check for error title
    const title = screen.getByTestId('error-message');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Failed to Load Dashboard');

    // Check for error details
    const details = screen.getByTestId('error-details');
    expect(details).toBeInTheDocument();
    expect(details).toHaveTextContent(errorMessage);
  });

  it('test_render_retry_button - Shows retry button', () => {
    const onRetry = jest.fn();
    render(<DashboardError message="Test error" onRetry={onRetry} />);

    // Check for retry button
    const retryButton = screen.getByTestId('retry-button');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass('btn');
    expect(retryButton).toHaveClass('btn-outline-danger');

    // Check for retry icon
    const retryIcon = retryButton.querySelector('.bi-arrow-clockwise');
    expect(retryIcon).toBeInTheDocument();

    // Check button text
    expect(retryButton).toHaveTextContent('Retry');

    // Check for ARIA label
    expect(retryButton).toHaveAttribute('aria-label', 'Retry loading dashboard');
  });

  it('test_on_retry_callback - Calls onRetry when clicked', () => {
    const onRetry = jest.fn();
    render(<DashboardError message="Test error" onRetry={onRetry} />);

    // Click retry button
    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);

    // Verify callback was called
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('test_no_retry_button_without_callback', () => {
    render(<DashboardError message="Test error" />);

    // Verify retry button is not rendered when onRetry is not provided
    const retryButton = screen.queryByTestId('retry-button');
    expect(retryButton).not.toBeInTheDocument();
  });

  it('test_accessible_error_state', () => {
    render(<DashboardError message="Test error" onRetry={jest.fn()} />);

    const errorContainer = screen.getByTestId('dashboard-error');

    // Check for ARIA attributes
    expect(errorContainer).toHaveAttribute('role', 'alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('test_default_error_message', () => {
    render(<DashboardError message="" />);

    const details = screen.getByTestId('error-details');
    expect(details).toHaveTextContent('An unexpected error occurred. Please try again.');
  });
});
