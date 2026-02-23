# API Contracts

**Branch**: `001-phase-2-features` | **Date**: 2026-02-22

## Overview

OpenAPI 3.0 specification for Phase-2 REST API endpoints.

**Base URL**: `/api`
**Authentication**: Bearer token (JWT) in Authorization header
**Content Type**: `application/json`

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-02-22T00:00:00Z"
}
```

**Response (400 Bad Request)**:
```json
{
  "detail": "Email already registered"
}
```

**Validation**:
- Email: required, valid format, unique
- Password: required, min 8 chars, uppercase, lowercase, number

---

### POST /auth/login

Authenticate user and receive access token.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "detail": "Invalid email or password"
}
```

**Notes**:
- Token expires in 7 days (604800 seconds)
- Token returned in response body AND set as HTTP-only cookie

---

### POST /auth/logout

Invalidate current session.

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:
```json
{
  "message": "Successfully logged out"
}
```

**Notes**:
- Deletes HTTP-only cookie
- Removes session from database (if using session blacklist)

---

### POST /auth/password-reset

Request password reset email.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Notes**:
- Always returns success message (security: prevent email enumeration)
- Rate limited: 3 requests per hour per email

---

## Dashboard Endpoints

### GET /dashboard

Get dashboard statistics and recent activity.

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:
```json
{
  "summary": {
    "total_tasks": 25,
    "pending_tasks": 10,
    "in_progress_tasks": 5,
    "completed_tasks": 10,
    "overdue_tasks": 2
  },
  "recent_tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Complete project proposal",
      "status": "pending",
      "due_date": "2026-02-25T00:00:00Z",
      "created_at": "2026-02-20T00:00:00Z"
    }
  ]
}
```

**Notes**:
- Recent tasks: last 5 created tasks
- Overdue: due_date < now AND status != completed

---

## Task Endpoints

### GET /tasks

List all tasks for the authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status (pending, in_progress, completed) |
| sort_by | string | created_at | Sort field (created_at, due_date, status) |
| order | string | desc | Sort order (asc, desc) |

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Complete project proposal",
      "description": "Write and submit the project proposal document",
      "status": "pending",
      "due_date": "2026-02-25T00:00:00Z",
      "created_at": "2026-02-20T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Review code changes",
      "description": null,
      "status": "in_progress",
      "due_date": "2026-02-23T00:00:00Z",
      "created_at": "2026-02-19T00:00:00Z"
    }
  ],
  "total": 2,
  "filters": {
    "status": null,
    "sort_by": "created_at",
    "order": "desc"
  }
}
```

---

### POST /tasks

Create a new task.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "title": "Complete project proposal",
  "description": "Write and submit the project proposal document",
  "status": "pending",
  "due_date": "2026-02-25T00:00:00Z"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Complete project proposal",
  "description": "Write and submit the project proposal document",
  "status": "pending",
  "due_date": "2026-02-25T00:00:00Z",
  "created_at": "2026-02-22T00:00:00Z"
}
```

**Validation**:
- Title: required, max 255 chars
- Description: optional, max 10000 chars
- Status: optional, default "pending"
- Due date: optional, must be in future

---

### GET /tasks/{id}

Get a specific task by ID.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Task unique identifier |

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Complete project proposal",
  "description": "Write and submit the project proposal document",
  "status": "pending",
  "due_date": "2026-02-25T00:00:00Z",
  "created_at": "2026-02-20T00:00:00Z"
}
```

**Response (404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

**Response (403 Forbidden)**:
```json
{
  "detail": "You do not have access to this task"
}
```

**Notes**:
- Returns 404 if task does not exist OR if user does not own the task (security)

---

### PUT /tasks/{id}

Update an existing task.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "title": "Updated project proposal",
  "status": "in_progress",
  "due_date": "2026-02-26T00:00:00Z"
}
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated project proposal",
  "description": "Write and submit the project proposal document",
  "status": "in_progress",
  "due_date": "2026-02-26T00:00:00Z",
  "created_at": "2026-02-20T00:00:00Z"
}
```

**Notes**:
- Partial update: only provided fields are updated
- Same validation as POST /tasks

---

### DELETE /tasks/{id}

Delete a task.

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:
```json
{
  "message": "Task deleted successfully"
}
```

**Response (404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

**Notes**:
- Returns 404 if task does not exist OR if user does not own the task
- Deletion is permanent (no soft delete)

---

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, POST operations |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Access denied (wrong user) |
| 404 | Not Found | Resource does not exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 5 requests | 1 minute |
| POST /auth/register | 3 requests | 1 hour |
| POST /auth/password-reset | 3 requests | 1 hour |
| All other endpoints | 100 requests | 1 minute |

**Headers on Rate Limit**:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1645526400
```

---

## Security Notes

1. **Authentication**: All endpoints except POST /auth/register, POST /auth/login, POST /auth/password-reset require Bearer token
2. **Data Isolation**: Users can only access their own tasks (enforced at query level)
3. **Input Validation**: All inputs validated on both frontend and backend
4. **Error Messages**: Generic messages to prevent information disclosure
