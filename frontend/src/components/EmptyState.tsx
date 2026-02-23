/**
 * EmptyState component for displaying empty states
 */
import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="text-center py-5">
      {icon && (
        <div className="mb-3 text-muted">
          {icon}
        </div>
      )}
      {!icon && (
        <div className="mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            fill="currentColor"
            className="bi bi-inbox text-muted"
            viewBox="0 0 16 16"
          >
            <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8 6 12h4l4.46-4-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm.64 1h4.76l2.25 2.812L11.02 11H4.98L3.37 7.812 5.62 5zM0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4zm3 9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1z"/>
          </svg>
        </div>
      )}
      <h5 className="mb-2">{title}</h5>
      <p className="text-muted mb-3">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
