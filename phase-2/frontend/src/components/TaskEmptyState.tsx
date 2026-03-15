/**
 * TaskEmptyState Component
 * 
 * Displays an empty state when there are no tasks.
 */
'use client';

import React from 'react';
import { EmptyState } from './EmptyState';

interface TaskEmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * TaskEmptyState component
 */
export function TaskEmptyState({
  title = 'No tasks yet',
  message = 'Get started by creating your first task!',
  actionLabel = 'Create Task',
  actionHref = '/tasks',
}: TaskEmptyStateProps) {
  // Task-specific icon
  const taskIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="currentColor"
      className="bi bi-card-checklist text-muted"
      viewBox="0 0 16 16"
    >
      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
      <path d="M10.5 5.5a.5.5 0 0 0-1 0v.636l-.707-.707a.5.5 0 1 0-.707.707l1.414 1.415a.5.5 0 0 0 .707 0l1.414-1.415a.5.5 0 0 0-.707-.707l-.707.707V5.5zm0 3a.5.5 0 0 0-1 0v.636l-.707-.707a.5.5 0 1 0-.707.707l1.414 1.415a.5.5 0 0 0 .707 0l1.414-1.415a.5.5 0 0 0-.707-.707l-.707.707V8.5zm-4 0a.5.5 0 0 0-1 0v.636l-.707-.707a.5.5 0 1 0-.707.707l1.414 1.415a.5.5 0 0 0 .707 0l1.414-1.415a.5.5 0 0 0-.707-.707l-.707.707V8.5zm0-3a.5.5 0 0 0-1 0v.636l-.707-.707a.5.5 0 1 0-.707.707l1.414 1.415a.5.5 0 0 0 .707 0l1.414-1.415a.5.5 0 0 0-.707-.707l-.707.707V5.5z"/>
    </svg>
  );

  return (
    <EmptyState
      title={title}
      message={message}
      actionLabel={actionLabel}
      actionHref={actionHref}
      icon={taskIcon}
    />
  );
}

export default TaskEmptyState;
