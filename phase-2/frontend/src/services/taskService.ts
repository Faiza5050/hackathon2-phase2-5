/**
 * Task Service for API calls
 * 
 * Handles all task-related API operations including CRUD operations.
 */

import type { Task, TaskCreate, TaskUpdate, TaskFilterOptions, TaskListResponse } from '@/types/task';

const API_URL = 'http://localhost:8000/api';

/**
 * Build query string from filter options
 */
function buildQueryString(options?: TaskFilterOptions): string {
  if (!options) return '';

  const params = new URLSearchParams();

  if (options.status) {
    params.append('status', options.status);
  }

  if (options.sortBy) {
    params.append('sort_by', options.sortBy);
  }

  if (options.order) {
    params.append('order', options.order);
  }

  if (options.search) {
    params.append('search', options.search);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Generic request handler with error handling
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers = getAuthHeaders();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as HeadersInit),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

class TaskService {
  /**
   * Get all tasks with optional filtering
   * @param options - Filter options (status, sortBy, order, search)
   * @returns Promise resolving to array of tasks
   */
  async getTasks(options?: TaskFilterOptions): Promise<Task[]> {
    const queryString = buildQueryString(options);
    const response = await request<TaskListResponse>(`/tasks${queryString}`);
    return response.tasks || [];
  }

  /**
   * Get a single task by ID
   * @param id - Task ID
   * @returns Promise resolving to task
   */
  async getTask(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}`);
  }

  /**
   * Create a new task
   * @param data - Task creation data
   * @returns Promise resolving to created task
   */
  async createTask(data: TaskCreate): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param data - Task update data (partial)
   * @returns Promise resolving to updated task
   */
  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a task
   * @param id - Task ID
   * @returns Promise resolving when deletion is complete
   */
  async deleteTask(id: string): Promise<void> {
    await request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const taskService = new TaskService();
export default taskService;
