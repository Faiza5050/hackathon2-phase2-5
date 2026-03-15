/**
 * Dashboard service for API calls
 * Provides dashboard data fetching with error handling and timeout support
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Task summary statistics interface
 */
export interface TaskSummary {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
}

/**
 * Task interface for recent tasks
 */
export interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  created_at: string;
}

/**
 * Dashboard data response interface
 */
export interface DashboardData {
  summary: TaskSummary;
  recent_tasks: Task[];
}

/**
 * Custom error class for dashboard service errors
 */
export class DashboardServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'DashboardServiceError';
  }
}

/**
 * Error types for better error handling
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof DashboardServiceError) {
    switch (error.code) {
      case ErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection.';
      case ErrorType.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorType.UNAUTHORIZED:
        return 'Session expired. Please log in again.';
      case ErrorType.NOT_FOUND:
        return 'Dashboard data not found.';
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

class DashboardService {
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000; // 1 second

  /**
   * Create an abort controller with timeout
   */
  private createTimeoutController(timeoutMs: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    return { controller, timeoutId };
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.BASE_DELAY * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return exponentialDelay + jitter;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(status?: number): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return !status || status >= 500 || status === 408;
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  private async request<T>(endpoint: string, options?: RequestInit, timeoutMs?: number): Promise<T> {
    const token = localStorage.getItem('access_token');
    const timeout = timeoutMs ?? this.DEFAULT_TIMEOUT;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const { controller, timeoutId } = this.createTimeoutController(timeout);

        try {
          const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
              ...headers,
              ...(options?.headers as HeadersInit),
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            let errorDetail = 'Request failed';
            try {
              const errorData = await response.json();
              errorDetail = errorData.detail || errorData.message || errorDetail;
            } catch {
              // Response is not JSON, use status text
              errorDetail = response.statusText || errorDetail;
            }

            // Handle specific error types
            if (response.status === 401) {
              throw new DashboardServiceError(
                'Unauthorized access. Please log in again.',
                response.status,
                ErrorType.UNAUTHORIZED
              );
            }

            if (response.status === 404) {
              throw new DashboardServiceError(
                errorDetail,
                response.status,
                ErrorType.NOT_FOUND
              );
            }

            if (response.status >= 500) {
              throw new DashboardServiceError(
                `Server error (${response.status}). Please try again later.`,
                response.status,
                ErrorType.SERVER
              );
            }

            throw new DashboardServiceError(errorDetail, response.status);
          }

          return response.json();
        } catch (error) {
          clearTimeout(timeoutId);

          // Handle abort (timeout)
          if (error instanceof Error && error.name === 'AbortError') {
            throw new DashboardServiceError(
              `Request timed out after ${timeout}ms`,
              undefined,
              ErrorType.TIMEOUT
            );
          }

          // Handle network errors
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new DashboardServiceError(
              'Network error. Please check your connection.',
              undefined,
              ErrorType.NETWORK
            );
          }

          throw error;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on non-retryable errors
        const dashboardError = error as DashboardServiceError;
        if (!this.isRetryableError(dashboardError.status)) {
          throw lastError;
        }

        // If this was the last attempt, throw the error
        if (attempt === this.MAX_RETRIES - 1) {
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        const delay = this.calculateDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new DashboardServiceError('Unknown error occurred', undefined, ErrorType.UNKNOWN);
  }

  /**
   * Get dashboard data with retry logic
   */
  async getDashboard(timeoutMs?: number): Promise<DashboardData> {
    return this.request<DashboardData>('/dashboard', undefined, timeoutMs);
  }

  /**
   * Refresh dashboard data (alias for getDashboard with explicit intent)
   */
  async refreshDashboard(timeoutMs?: number): Promise<DashboardData> {
    return this.getDashboard(timeoutMs);
  }
}

export const dashboardService = new DashboardService();
