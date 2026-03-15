/**
 * TaskItem Component
 * 
 * Displays a single task as a table row or card item.
 * Supports edit and delete actions.
 */
'use client';

import React from 'react';
import type { Task } from '@/types/task';
import { TaskStatusBadge } from './TaskStatusBadge';

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onView?: (task: Task) => void;
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Check if a task is overdue
 */
function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
}

/**
 * TaskItem component
 */
export function TaskItem({
  task,
  onEdit,
  onDelete,
  onView,
  className = '',
}: TaskItemProps) {
  const overdue = isOverdue(task.due_date, task.status);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task);
  };

  const handleView = () => {
    onView?.(task);
  };

  return (
    <tr 
      className={`task-item ${className} ${overdue ? 'table-danger' : ''}`}
      onClick={handleView}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleView();
        }
      }}
      aria-label={`Task: ${task.title}`}
    >
      <td>
        <div className="d-flex align-items-center">
          <div>
            <div className={`fw-semibold ${overdue ? 'text-danger' : ''}`}>
              {task.title}
            </div>
            {task.description && (
              <small className="text-muted d-none d-md-block">
                {task.description.substring(0, 50)}
                {task.description.length > 50 ? '...' : ''}
              </small>
            )}
          </div>
        </div>
      </td>
      <td>
        <TaskStatusBadge status={task.status} />
      </td>
      <td>
        <span className={overdue ? 'text-danger fw-semibold' : ''}>
          {formatDate(task.due_date)}
        </span>
      </td>
      <td className="d-none d-lg-table-cell">
        {formatDate(task.created_at)}
      </td>
      <td>
        <div className="btn-group btn-group-sm" role="group">
          {onView && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleView}
              aria-label={`View ${task.title}`}
            >
              View
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleEdit}
              aria-label={`Edit ${task.title}`}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleDelete}
              aria-label={`Delete ${task.title}`}
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default TaskItem;
