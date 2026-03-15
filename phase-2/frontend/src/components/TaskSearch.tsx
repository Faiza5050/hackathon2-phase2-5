/**
 * TaskSearch Component
 *
 * Search input for filtering tasks by title or description.
 * Features:
 * - Debounced search (300ms delay)
 * - Search icon
 * - Clear button (appears when text is entered)
 * - Keyboard shortcut (Escape to clear)
 * - Accessible (ARIA labels)
 */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TaskSearchProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes (debounced) */
  onSearchChange: (value: string) => void;
  /** Optional custom class name */
  className?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * TaskSearch component for searching tasks
 * Implements debounced search with 300ms delay
 */
export function TaskSearch({
  value,
  onSearchChange,
  className = '',
  placeholder = 'Search tasks by title or description...',
  disabled = false,
}: TaskSearchProps) {
  // Local state for immediate input feedback
  const [inputValue, setInputValue] = useState(value);
  
  // Ref for debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Debounce delay in milliseconds
  const DEBOUNCE_DELAY = 300;

  // Sync local state with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced callback
  const debouncedOnChange = useCallback((newValue: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(newValue);
    }, DEBOUNCE_DELAY);
  }, [onSearchChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedOnChange(newValue);
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onSearchChange('');
    
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear on Escape key
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`input-group ${className}`}>
      <span
        className="input-group-text bg-light border-end-0"
        style={{ borderTopLeftRadius: '0.375rem', borderBottomLeftRadius: '0.375rem' }}
        aria-hidden="true"
      >
        <svg
          data-testid="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-search text-muted"
          viewBox="0 0 16 16"
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
      </span>
      <input
        type="search"
        className="form-control border-start-0"
        style={{ borderTopRightRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Search tasks by title or description"
        aria-describedby="search-help"
        id="task-search-input"
      />
      {inputValue && (
        <button
          data-testid="clear-button"
          className="btn btn-outline-secondary border-start-0"
          type="button"
          onClick={handleClear}
          style={{
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            marginLeft: '-1px',
          }}
          aria-label="Clear search"
          title="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            className="bi bi-x-lg"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
          </svg>
        </button>
      )}
      <span id="search-help" className="visually-hidden">
        Type to search tasks by title or description. Press Escape to clear. Search is debounced with 300ms delay.
      </span>
    </div>
  );
}

export default TaskSearch;
