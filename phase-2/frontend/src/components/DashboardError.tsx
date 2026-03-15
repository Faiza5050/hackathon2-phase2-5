/**
 * DashboardError component for error state
 * Displays error message with retry functionality
 */
import React from 'react';

interface DashboardErrorProps {
  message: string;
  onRetry?: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div
      className="alert alert-danger d-flex flex-column align-items-center justify-content-center py-5"
      role="alert"
      aria-live="assertive"
      data-testid="dashboard-error"
    >
      {/* Error Icon */}
      <div className="mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          fill="currentColor"
          className="bi bi-exclamation-triangle-fill"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </svg>
      </div>

      {/* Error Message */}
      <h5 className="alert-heading mb-2" data-testid="error-message">
        Failed to Load Dashboard
      </h5>
      <p className="mb-4 text-center" data-testid="error-details">
        {message || 'An unexpected error occurred. Please try again.'}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          className="btn btn-outline-danger"
          onClick={onRetry}
          aria-label="Retry loading dashboard"
          data-testid="retry-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-clockwise me-2"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
            />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
          </svg>
          Retry
        </button>
      )}
    </div>
  );
}
