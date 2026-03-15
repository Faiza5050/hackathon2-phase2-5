/**
 * Authentication service for API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthError {
  detail: string;
}

interface JWTPayload {
  user_id: string;
  email: string;
  exp: number;
  iat: number;
}

class AuthService {
  // Generic request function
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('access_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Direct fetch call to backend
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers as HeadersInit),
      },
    });

    if (!response.ok) {
      // Try to parse error JSON
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Decode JWT token to extract payload
  private decodeToken(token: string): JWTPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Signup function
  async register(email: string, password: string): Promise<User> {
    // Direct fetch to backend signup endpoint
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Signup failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Login function
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('access_token', data.access_token);
    
    return data;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear token from localStorage
      localStorage.removeItem('access_token');
    }
  }

  // Get current user from JWT token
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;

      const payload = this.decodeToken(token);
      if (!payload) return null;

      return {
        id: payload.user_id,
        email: payload.email, // Now includes email from JWT token
        created_at: '', // Not available in token, use /api/auth/me for full details
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get full current user details from API
  async getCurrentUserDetails(): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Get current user details error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
