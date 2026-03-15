/**
 * API Mocking Utilities
 * 
 * Provides helper functions for creating MSW handlers and mock data.
 * Use these utilities to mock API responses in tests.
 */

import { http, HttpResponse, delay } from 'msw';

// Base API URL (matches the one used in services)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Mock user data factory
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Mock todo data factory
 */
export function createMockTodo(overrides?: Partial<MockTodo>): MockTodo {
  return {
    id: 'test-todo-id',
    title: 'Test Todo',
    description: 'This is a test todo item',
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Mock auth response factory
 */
export function createMockAuthResponse(overrides?: Partial<MockAuthResponse>): MockAuthResponse {
  return {
    access_token: 'mock-jwt-token-12345',
    token_type: 'bearer',
    user: createMockUser(),
    ...overrides,
  };
}

/**
 * Create a successful HTTP response
 */
export function createSuccessResponse<T>(data: T, status = 200) {
  return HttpResponse.json(data as Record<string, unknown>, { status });
}

/**
 * Create an error HTTP response
 */
export function createErrorResponse(message: string, status = 400) {
  return HttpResponse.json(
    { detail: message },
    { status }
  );
}

/**
 * Create a handler for login endpoint
 */
export function createLoginHandler(email = 'test@example.com', password = 'password123') {
  return http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === email && body.password === password) {
      return createSuccessResponse(createMockAuthResponse());
    }
    
    return createErrorResponse('Invalid credentials', 401);
  });
}

/**
 * Create a handler for register endpoint
 */
export function createRegisterHandler() {
  return http.post(`${API_BASE_URL}/api/auth/register`, async () => {
    return createSuccessResponse({ message: 'Registration successful' }, 201);
  });
}

/**
 * Create a handler for get current user endpoint
 */
export function createGetCurrentUserHandler(user?: MockUser) {
  return http.get(`${API_BASE_URL}/api/auth/me`, () => {
    return createSuccessResponse(user || createMockUser());
  });
}

/**
 * Create a handler for logout endpoint
 */
export function createLogoutHandler() {
  return http.post(`${API_BASE_URL}/api/auth/logout`, () => {
    return createSuccessResponse({ message: 'Logout successful' });
  });
}

/**
 * Create handlers for todos CRUD endpoints
 */
export function createTodosHandlers(todos: MockTodo[] = []) {
  let todoList = [...todos];

  return [
    // Get all todos
    http.get(`${API_BASE_URL}/api/todos`, () => {
      return createSuccessResponse(todoList);
    }),

    // Get single todo
    http.get(`${API_BASE_URL}/api/todos/:id`, ({ params }) => {
      const { id } = params;
      const todo = todoList.find(t => t.id === id);
      
      if (todo) {
        return createSuccessResponse(todo);
      }
      
      return createErrorResponse('Todo not found', 404);
    }),

    // Create todo
    http.post(`${API_BASE_URL}/api/todos`, async ({ request }) => {
      const body = await request.json() as Partial<MockTodo>;
      const newTodo = createMockTodo(body as MockTodo);
      todoList.push(newTodo);
      return createSuccessResponse(newTodo, 201);
    }),

    // Update todo
    http.put(`${API_BASE_URL}/api/todos/:id`, async ({ params, request }) => {
      const { id } = params;
      const body = await request.json() as Partial<MockTodo>;
      const index = todoList.findIndex(t => t.id === id);
      
      if (index !== -1) {
        todoList[index] = { ...todoList[index], ...body };
        return createSuccessResponse(todoList[index]);
      }
      
      return createErrorResponse('Todo not found', 404);
    }),

    // Delete todo
    http.delete(`${API_BASE_URL}/api/todos/:id`, ({ params }) => {
      const { id } = params;
      const index = todoList.findIndex(t => t.id === id);
      
      if (index !== -1) {
        todoList.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }
      
      return createErrorResponse('Todo not found', 404);
    }),
  ];
}

// Type definitions for mock data
export interface MockUser {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface MockTodo {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockAuthResponse {
  access_token: string;
  token_type: string;
  user: MockUser;
}

export interface MockTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Mock task data factory
 */
export function createMockTask(overrides?: Partial<MockTask>): MockTask {
  return {
    id: 'test-task-id',
    user_id: 'test-user-id',
    title: 'Test Task',
    description: 'This is a test task',
    status: 'pending',
    due_date: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create handlers for tasks CRUD endpoints
 */
export function createTasksHandlers(tasks: MockTask[] = []) {
  let taskList = [...tasks];

  return [
    // Get all tasks (with optional filtering)
    http.get(`${API_BASE_URL}/api/tasks`, ({ request }) => {
      const url = new URL(request.url);
      const status = url.searchParams.get('status');
      
      let filteredTasks = [...taskList];
      if (status) {
        filteredTasks = filteredTasks.filter(t => t.status === status);
      }
      
      return createSuccessResponse({ tasks: filteredTasks, total: filteredTasks.length });
    }),

    // Get single task
    http.get(`${API_BASE_URL}/api/tasks/:id`, ({ params }) => {
      const { id } = params;
      const task = taskList.find(t => t.id === id);

      if (task) {
        return createSuccessResponse(task);
      }

      return createErrorResponse('Task not found', 404);
    }),

    // Create task
    http.post(`${API_BASE_URL}/api/tasks`, async ({ request }) => {
      const body = await request.json() as Partial<MockTask>;
      const newTask = createMockTask(body as MockTask);
      taskList.push(newTask);
      return createSuccessResponse(newTask, 201);
    }),

    // Update task
    http.put(`${API_BASE_URL}/api/tasks/:id`, async ({ params, request }) => {
      const { id } = params;
      const body = await request.json() as Partial<MockTask>;
      const index = taskList.findIndex(t => t.id === id);

      if (index !== -1) {
        taskList[index] = { ...taskList[index], ...body, updated_at: new Date().toISOString() };
        return createSuccessResponse(taskList[index]);
      }

      return createErrorResponse('Task not found', 404);
    }),

    // Delete task
    http.delete(`${API_BASE_URL}/api/tasks/:id`, ({ params }) => {
      const { id } = params;
      const index = taskList.findIndex(t => t.id === id);

      if (index !== -1) {
        taskList.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }

      return createErrorResponse('Task not found', 404);
    }),
  ];
}
