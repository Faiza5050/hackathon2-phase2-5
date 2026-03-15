/**
 * TaskModal Component
 * 
 * Modal for viewing and editing task details.
 * Uses Bootstrap modal component.
 */
'use client';

import React, { useEffect } from 'react';
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';
import { TaskForm } from './TaskForm';
import { TaskStatusBadge } from './TaskStatusBadge';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSubmit?: (data: TaskCreate | TaskUpdate) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  mode?: 'view' | 'edit';
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * TaskModal component
 */
export function TaskModal({
  isOpen,
  onClose,
  task,
  onSubmit,
  isLoading = false,
  error,
  mode = 'view',
}: TaskModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isEditMode = mode === 'edit';
  const modalTitle = isEditMode
    ? (task ? 'Edit Task' : 'Create Task')
    : 'Task Details';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="taskModalLabel"
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="taskModalLabel">
              {modalTitle}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
              disabled={isLoading}
            />
          </div>
          <div className="modal-body">
            {isEditMode ? (
              <TaskForm
                task={task}
                onSubmit={onSubmit!}
                onCancel={onClose}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              task && (
                <div className="task-details">
                  <div className="mb-3">
                    <h4 className="mb-2">{task.title}</h4>
                    <TaskStatusBadge status={task.status} />
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Description</h6>
                    <p className="mb-0">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted mb-1">Status</h6>
                      <p className="mb-0">
                        <TaskStatusBadge status={task.status} />
                      </p>
                    </div>

                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted mb-1">Due Date</h6>
                      <p className="mb-0">{formatDate(task.due_date)}</p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted mb-1">Created</h6>
                      <p className="mb-0">{formatDate(task.created_at)}</p>
                    </div>

                    {task.updated_at && (
                      <div className="col-md-6 mb-3">
                        <h6 className="text-muted mb-1">Last Updated</h6>
                        <p className="mb-0">{formatDate(task.updated_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
          {!isEditMode && (
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
