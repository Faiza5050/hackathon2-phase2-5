/**
 * DeleteConfirmModal Component
 * 
 * Modal for confirming task deletion.
 */
'use client';

import React, { useEffect } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  taskTitle?: string;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * DeleteConfirmModal component
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isLoading = false,
  error,
}: DeleteConfirmModalProps) {
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

  // Clear error when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Error is managed by parent
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="deleteModalLabel"
      aria-describedby="deleteModalDescription"
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title" id="deleteModalLabel">
              Delete Task
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
              disabled={isLoading}
            />
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <p id="deleteModalDescription">
              Are you sure you want to delete the task
              {taskTitle && (
                <strong> &quot;{taskTitle}&quot;</strong>
              )}?
            </p>
            <p className="text-muted mb-0">
              This action cannot be undone.
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
