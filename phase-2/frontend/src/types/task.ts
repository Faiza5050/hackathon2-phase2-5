/**
 * Task Types and Interfaces
 * 
 * Type definitions for task management functionality.
 */

/**
 * Task status enumeration
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Task interface representing a complete task object from the API
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * TaskCreate interface for creating new tasks
 */
export interface TaskCreate {
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string | null;
}

/**
 * TaskUpdate interface for updating existing tasks (partial)
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string | null;
}

/**
 * Task filter options for listing tasks
 */
export interface TaskFilterOptions {
  status?: TaskStatus;
  sortBy?: 'created_at' | 'due_date' | 'title' | 'status';
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Task list response from API
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number;
}
