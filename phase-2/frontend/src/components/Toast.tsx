/**
 * Toast Notification Component
 * Displays toast notifications with different types (success, error, warning, info)
 */
'use client';

import React, { useEffect } from 'react';
import { useToast, type Toast } from '../context/ToastContext';

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, message, type } = toast;

  // Bootstrap alert variants for different toast types
  const getAlertClass = (toastType: string): string => {
    switch (toastType) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  // Icon for different toast types
  const getIcon = (toastType: string): string => {
    switch (toastType) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`alert ${getAlertClass(type)} alert-dismissible fade show`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-testid={`toast-${type}`}
    >
      <span className="me-2" aria-hidden="true">
        {getIcon(type)}
      </span>
      {message}
      <button
        type="button"
        className="btn-close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        data-bs-dismiss="alert"
      />
    </div>
  );
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export default function Toast({ position = 'top-right' }: ToastContainerProps) {
  const { toasts, removeToast } = useToast();

  // Get position classes
  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-right':
        return 'position-fixed top-0 end-0 p-3';
      case 'top-left':
        return 'position-fixed top-0 start-0 p-3';
      case 'top-center':
        return 'position-fixed top-0 start-50 translate-middle-x p-3';
      case 'bottom-right':
        return 'position-fixed bottom-0 end-0 p-3';
      case 'bottom-left':
        return 'position-fixed bottom-0 start-0 p-3';
      case 'bottom-center':
        return 'position-fixed bottom-0 start-50 translate-middle-x p-3';
      default:
        return 'position-fixed top-0 end-0 p-3';
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={getPositionClasses()}
      style={{ zIndex: 1090 }}
      role="region"
      aria-label="Notifications"
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
