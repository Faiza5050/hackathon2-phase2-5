/**
 * MSW Request Handlers
 * 
 * Default mock handlers for API endpoints.
 * These handlers are used by the MSW server in tests/setup.ts
 */

import { http, HttpResponse } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Default mock handlers for all API endpoints
 */
export const handlers = [
  // Auth: Login
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Accept any valid-looking credentials for testing
    if (body.email && body.password) {
      return HttpResponse.json({
        access_token: 'mock-jwt-token-12345',
        token_type: 'bearer',
        user: {
          id: 'test-user-id',
          email: body.email,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Auth: Register
  http.post(`${API_BASE_URL}/api/auth/register`, async () => {
    return HttpResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    );
  }),

  // Auth: Get Current User
  http.get(`${API_BASE_URL}/api/auth/me`, () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      is_active: true,
      created_at: new Date().toISOString(),
    });
  }),

  // Auth: Logout
  http.post(`${API_BASE_URL}/api/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logout successful' });
  }),

  // Todos: Get all todos
  http.get(`${API_BASE_URL}/api/todos`, () => {
    return HttpResponse.json([
      {
        id: 'todo-1',
        title: 'Sample Todo 1',
        description: 'This is a sample todo',
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'todo-2',
        title: 'Sample Todo 2',
        description: 'Another sample todo',
        is_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }),

  // Todos: Get single todo
  http.get(`${API_BASE_URL}/api/todos/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      title: `Todo ${id}`,
      description: 'Sample todo description',
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // Todos: Create todo
  http.post(`${API_BASE_URL}/api/todos`, async ({ request }) => {
    const body = await request.json() as { title: string; description?: string };
    return HttpResponse.json(
      {
        id: `todo-${Date.now()}`,
        title: body.title,
        description: body.description,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Todos: Update todo
  http.put(`${API_BASE_URL}/api/todos/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<{ title: string; description: string; is_completed: boolean }>;
    return HttpResponse.json({
      id,
      title: body.title ?? `Todo ${id}`,
      description: body.description ?? 'Sample todo description',
      is_completed: body.is_completed ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // Todos: Delete todo
  http.delete(`${API_BASE_URL}/api/todos/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
