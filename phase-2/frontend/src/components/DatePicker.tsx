/**
 * DatePicker Component
 * 
 * Date picker input for selecting due dates.
 * Uses native HTML5 date input with Bootstrap styling.
 */
'use client';

import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  name?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string | null;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * DatePicker component
 */
export function DatePicker({
  value,
  onChange,
  label = 'Due Date',
  id = 'due_date',
  name = 'due_date',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  className = '',
  error,
}: DatePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`date-picker ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div className="input-group">
        <input
          type="date"
          id={id}
          name={name}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={handleChange}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          required={required}
        />
        {value && !disabled && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClear}
            aria-label="Clear date"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-x-lg"
              viewBox="0 0 16 16"
            >
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
            </svg>
          </button>
        )}
        {error && (
          <div className="invalid-feedback">{error}</div>
        )}
      </div>
    </div>
  );
}

export default DatePicker;
