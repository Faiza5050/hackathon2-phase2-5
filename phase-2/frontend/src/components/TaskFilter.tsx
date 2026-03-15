/**
 * TaskFilter Component
 *
 * Filter controls for task list.
 * Allows filtering by status, sorting options, and search.
 */
'use client';

import React from 'react';
import type { TaskStatus } from '@/types/task';
import { TaskSearch } from '@/components/TaskSearch';

interface TaskFilterProps {
  status?: TaskStatus | 'all';
  sortBy?: 'created_at' | 'due_date' | 'title' | 'status';
  order?: 'asc' | 'desc';
  search?: string;
  onStatusChange?: (status: TaskStatus | 'all') => void;
  onSortByChange?: (sortBy: 'created_at' | 'due_date' | 'title' | 'status') => void;
  onOrderChange?: (order: 'asc' | 'desc') => void;
  onSearchChange?: (search: string) => void;
  className?: string;
}

/**
 * TaskFilter component
 */
export function TaskFilter({
  status = 'all',
  sortBy = 'created_at',
  order = 'desc',
  search = '',
  onStatusChange,
  onSortByChange,
  onOrderChange,
  onSearchChange,
  className = '',
}: TaskFilterProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange?.(e.target.value as TaskStatus | 'all');
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortByChange?.(e.target.value as 'created_at' | 'due_date' | 'title' | 'status');
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onOrderChange?.(e.target.value as 'asc' | 'desc');
  };

  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  return (
    <div className={`task-filter ${className}`}>
      <div className="row g-3 align-items-end">
        {/* Search Input - Full width on mobile, 4 cols on larger screens */}
        <div className="col-12 col-md-4">
          <label htmlFor="task-search-input" className="form-label">
            Search
          </label>
          <TaskSearch
            value={search}
            onSearchChange={handleSearchChange}
            placeholder="Search tasks by title or description..."
          />
        </div>

        <div className="col-6 col-md-2">
          <label htmlFor="filter-status" className="form-label">
            Status
          </label>
          <select
            id="filter-status"
            className="form-select"
            value={status}
            onChange={handleStatusChange}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="col-6 col-md-3">
          <label htmlFor="filter-sort" className="form-label">
            Sort By
          </label>
          <select
            id="filter-sort"
            className="form-select"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value="created_at">Created Date</option>
            <option value="due_date">Due Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="col-6 col-md-3">
          <label htmlFor="filter-order" className="form-label">
            Order
          </label>
          <select
            id="filter-order"
            className="form-select"
            value={order}
            onChange={handleOrderChange}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default TaskFilter;
