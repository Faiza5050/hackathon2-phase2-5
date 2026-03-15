/**
 * TaskList Component
 * 
 * Displays a list of tasks in a responsive table format.
 * Handles empty states and provides action handlers.
 */
'use client';

import React from 'react';
import type { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { TaskEmptyState } from './TaskEmptyState';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onView?: (task: Task) => void;
  className?: string;
}

/**
 * TaskList component
 */
export function TaskList({
  tasks,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  className = '',
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="task-list-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <TaskEmptyState />;
  }

  return (
    <div className={`task-list ${className}`}>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col">Due Date</th>
              <th scope="col" className="d-none d-lg-table-cell">Created</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskList;
