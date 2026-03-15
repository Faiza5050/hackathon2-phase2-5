/**
 * TaskStatusBadge Component
 * 
 * Displays a colored badge representing the task status.
 */
'use client';

import React from 'react';
import type { TaskStatus } from '@/types/task';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

/**
 * Get the Bootstrap badge color class for a given status
 */
export function getStatusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-success';
    case 'in_progress':
      return 'bg-info';
    case 'pending':
    default:
      return 'bg-warning';
  }
}

/**
 * Get the display label for a given status
 */
export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'pending':
    default:
      return 'Pending';
  }
}

/**
 * TaskStatusBadge component
 */
export function TaskStatusBadge({ status, className = '' }: TaskStatusBadgeProps) {
  const badgeClass = getStatusBadgeClass(status);
  const label = getStatusLabel(status);

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {label}
    </span>
  );
}

export default TaskStatusBadge;
