/**
 * TaskForm Component
 * 
 * Form for creating and editing tasks.
 * Supports validation and error handling.
 */
'use client';

import React, { useState, useEffect } from 'react';
import type { Task, TaskCreate, TaskUpdate, TaskStatus } from '@/types/task';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
function formatDateForInput(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * TaskForm component
 */
export function TaskForm({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
  error: externalError,
}: TaskFormProps) {
  const isEditMode = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatus,
    due_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: formatDateForInput(task.due_date),
      });
    }
  }, [task]);

  // Clear submit error when form changes
  useEffect(() => {
    setSubmitError(null);
  }, [formData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: TaskCreate | TaskUpdate = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      due_date: formData.due_date || null,
    };

    try {
      setSubmitError(null);
      await onSubmit(submitData);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const displayError = submitError || externalError;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {displayError && (
        <div className="alert alert-danger" role="alert">
          {displayError}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="title" className="form-label">
          Title <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          disabled={isLoading}
          maxLength={200}
          required
        />
        {errors.title && (
          <div className="invalid-feedback">{errors.title}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description (optional)"
          disabled={isLoading}
          rows={4}
          maxLength={1000}
        />
        {errors.description && (
          <div className="invalid-feedback">{errors.description}</div>
        )}
        <div className="form-text">
          {formData.description.length}/1000 characters
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="due_date" className="form-label">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            className="form-control"
            value={formData.due_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditMode ? 'Update Task' : 'Create Task'
          )}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
