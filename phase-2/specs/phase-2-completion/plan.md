# Implementation Plan: Phase-2 Todo Full-Stack Application Completion

**Branch**: `phase-2-completion` | **Date**: 2026-03-14 | **Spec**: `specs/phase-2-completion/spec.md`

**Input**: Phase-2 requirements from CLAUDE.md - Transform console app into multi-user web application

## Summary

Complete the implementation of a multi-user Todo web application with:
1. **Authentication**: User signup/signin using JWT-based Better Auth pattern
2. **Task Management**: Full CRUD operations for tasks with filtering and sorting
3. **Dashboard**: Task statistics and recent activity view
4. **Database**: Neon Serverless PostgreSQL with SQLModel/SQLAlchemy ORM
5. **Frontend**: Next.js 14 + React + TypeScript + Bootstrap responsive UI

**Current State**: ~80% complete - Core infrastructure exists but missing critical UI components, tests, and production readiness features.

## Technical Context

**Language/Version**: Python 3.11+, TypeScript 5.3+, Node.js 20+
**Primary Dependencies**: 
- Backend: FastAPI 0.109+, SQLModel/SQLAlchemy 2.0, Pydantic 2.5
- Frontend: Next.js 14, React 18, Bootstrap 5.3
**Storage**: Neon Serverless PostgreSQL (remote connection configured)
**Testing**: pytest (backend), Jest + Testing Library (frontend) - **NOT YET IMPLEMENTED**
**Target Platform**: Web application (localhost development → production deployment)
**Project Type**: Full-stack web application with separate frontend/backend
**Performance Goals**: p95 < 200ms for API endpoints, < 3s page load
**Constraints**: JWT tokens valid 7 days, password requirements (8+ chars, mixed case, number)
**Scale/Scope**: Single-user task management per account, multi-user system

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Test-First (NON-NEGOTIABLE) | ❌ VIOLATION | No tests exist in backend/tests or frontend/tests |
| Integration Testing | ❌ VIOLATION | No contract tests for API endpoints |
| Text I/O & Observability | ⚠️ PARTIAL | Logging configured, no structured logging |
| CLI Interface | N/A | Web application, not CLI tool |
| Library-First | ✅ PASS | Services layer properly separated |

**Gates to Pass Before Implementation**:
1. Create test infrastructure before feature implementation
2. Define API contracts in OpenAPI/Swagger format
3. Set up integration test framework

## Project Structure

### Documentation (this feature)

```text
specs/phase-2-completion/
├── plan.md              # This file
├── research.md          # Current state analysis
├── data-model.md        # Database schema documentation
├── quickstart.md        # Development setup guide
├── contracts/           # API contracts
│   ├── auth.yaml
│   ├── tasks.yaml
│   └── dashboard.yaml
└── tasks.md             # Testable tasks (to be created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── core/
│   │   ├── config.py        # Settings management
│   │   ├── database.py      # DB connection & session
│   │   └── security.py      # Password hashing, JWT
│   ├── models/
│   │   ├── user.py          # User SQLAlchemy model
│   │   ├── task.py          # Task SQLAlchemy model
│   │   └── session.py       # Session/Token model
│   ├── schemas/
│   │   ├── user.py          # User Pydantic schemas
│   │   └── task.py          # Task Pydantic schemas
│   ├── services/
│   │   ├── user_service.py  # User business logic
│   │   ├── task_service.py  # Task business logic
│   │   └── auth_service.py  # JWT & session mgmt
│   └── api/
│       ├── auth.py          # /api/auth endpoints
│       ├── tasks.py         # /api/tasks endpoints
│       └── dashboard.py     # /api/dashboard endpoints
├── tests/                   # MISSING - needs creation
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── contract/
├── alembic/                 # MISSING - needs migration
│   └── versions/
├── .env                     # Environment variables
├── requirements.txt
└── alembic.ini

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with AuthProvider
│   │   ├── page.tsx         # Home (redirects)
│   │   ├── login/
│   │   │   └── page.tsx     # Login page ✅ EXISTS
│   │   ├── register/
│   │   │   └── page.tsx     # Register page ✅ EXISTS
│   │   ├── dashboard/
│   │   │   └── page.tsx     # Dashboard page ✅ EXISTS
│   │   └── tasks/           # MISSING - needs implementation
│   │       └── page.tsx
│   ├── components/
│   │   ├── StatsCard.tsx    # Stats card component ✅
│   │   ├── EmptyState.tsx   # Empty state component ✅
│   │   ├── ProtectedRoute.tsx # Auth guard ✅
│   │   ├── TaskList.tsx     # MISSING
│   │   ├── TaskForm.tsx     # MISSING
│   │   └── TaskItem.tsx     # MISSING
│   ├── context/
│   │   └── AuthContext.tsx  # Auth state management ✅
│   └── services/
│       ├── authService.ts   # Auth API calls ✅
│       ├── dashboardService.ts # Dashboard API ✅
│       └── taskService.ts   # MISSING - needs implementation
├── tests/                   # MISSING - needs creation
│   ├── components/
│   └── services/
├── .env.local.example
├── package.json
└── next.config.js
```

**Structure Decision**: Option 2 (Web application with separate frontend/backend) - already established in project.

## Gap Analysis: What's Missing

### Backend (Priority: HIGH)

| Component | Status | Priority |
|-----------|--------|----------|
| Database migrations (Alembic) | ❌ Missing | CRITICAL |
| Unit tests (services, schemas) | ❌ Missing | CRITICAL |
| Integration tests (API endpoints) | ❌ Missing | CRITICAL |
| Contract tests (OpenAPI validation) | ❌ Missing | HIGH |
| User email in JWT token | ❌ Missing | MEDIUM |
| Password reset functionality | ❌ Missing | LOW |
| Email verification on signup | ❌ Missing | LOW |
| Rate limiting on auth endpoints | ❌ Missing | MEDIUM |
| Input sanitization | ⚠️ Partial | MEDIUM |
| Health check with DB connectivity | ⚠️ Partial | LOW |

### Frontend (Priority: HIGH)

| Component | Status | Priority |
|-----------|--------|----------|
| Tasks page (list view) | ❌ Missing | CRITICAL |
| Task creation form/modal | ❌ Missing | CRITICAL |
| Task edit functionality | ❌ Missing | CRITICAL |
| Task delete with confirmation | ❌ Missing | CRITICAL |
| Task filtering (by status) | ❌ Missing | HIGH |
| Task sorting | ❌ Missing | MEDIUM |
| Task detail view | ❌ Missing | MEDIUM |
| Loading states | ⚠️ Partial | MEDIUM |
| Error handling & toasts | ❌ Missing | HIGH |
| Form validation feedback | ⚠️ Partial | HIGH |
| Unit tests (components) | ❌ Missing | CRITICAL |
| Integration tests (pages) | ❌ Missing | CRITICAL |
| Environment configuration | ⚠️ Partial | HIGH |

### DevOps & Production Readiness (Priority: MEDIUM)

| Component | Status | Priority |
|-----------|--------|----------|
| Docker configuration | ❌ Missing | MEDIUM |
| CI/CD pipeline | ❌ Missing | MEDIUM |
| Production environment setup | ❌ Missing | HIGH |
| Secret management | ❌ Missing | CRITICAL |
| Logging & monitoring | ⚠️ Partial | MEDIUM |
| API documentation (Swagger) | ✅ Exists (auto) | - |
| Database backup strategy | ❌ Missing | HIGH |
| Error tracking (Sentry) | ❌ Missing | LOW |

## Phase 1: Data Model & Contracts

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (for token revocation)
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### API Contracts

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Authenticate & get JWT token | No |
| POST | `/api/auth/logout` | Revoke session | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |

#### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | List user's tasks (filterable, sortable) | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| GET | `/api/tasks/{id}` | Get specific task | Yes |
| PUT | `/api/tasks/{id}` | Update task | Yes |
| DELETE | `/api/tasks/{id}` | Delete task | Yes |

#### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | Get stats + recent tasks | Yes |

### Error Response Format

```json
{
  "detail": "Error message here",
  "status_code": 400,
  "errors": ["Optional field-level errors"]
}
```

### Success Response Format

```json
{
  "data": { /* response payload */ },
  "message": "Optional success message"
}
```

## Phase 2: Implementation Tasks

Tasks will be created via `/sp.tasks` command with test-first approach:

1. **Backend Infrastructure**
   - Set up Alembic migrations
   - Create initial migration for users, tasks, sessions
   - Add unit tests for services
   - Add integration tests for API endpoints

2. **Frontend Task Management UI**
   - Create taskService.ts for API calls
   - Build Tasks page with list view
   - Implement TaskForm component (create/edit)
   - Add TaskItem component with delete
   - Implement filtering and sorting

3. **Production Readiness**
   - Docker Compose setup
   - Environment variable management
   - CI/CD pipeline configuration
   - Monitoring and logging setup

## Complexity Tracking

> **No constitution violations requiring justification**

The project follows established patterns. Main complexity is in ensuring test coverage and production readiness, which are constitution requirements, not violations.

## Acceptance Criteria

### Functional Requirements

- [ ] User can register with email/password
- [ ] User can login and receive JWT token
- [ ] User can logout (revoke session)
- [ ] User can view dashboard with task statistics
- [ ] User can create tasks with title, description, status, due date
- [ ] User can view all their tasks with filtering/sorting
- [ ] User can view individual task details
- [ ] User can update task fields
- [ ] User can delete tasks
- [ ] All operations are user-scoped (users can't access others' data)

### Non-Functional Requirements

- [ ] All API endpoints have unit tests (80%+ coverage)
- [ ] All API endpoints have integration tests
- [ ] Frontend components have unit tests
- [ ] Database migrations are version-controlled
- [ ] Passwords are hashed with bcrypt
- [ ] JWT tokens expire after 7 days
- [ ] CORS configured for frontend origin
- [ ] Input validation on all endpoints
- [ ] Error handling with appropriate HTTP status codes
- [ ] Logging for security events (login, registration)

### Performance Requirements

- [ ] API response time p95 < 200ms
- [ ] Page load time < 3s on localhost
- [ ] Database queries use indexes
- [ ] No N+1 query issues

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database connection issues | HIGH | Use connection pooling, add retry logic |
| JWT token security | HIGH | Use strong SECRET_KEY, HTTPS in production |
| Test coverage gaps | MEDIUM | Enforce coverage thresholds in CI |
| Frontend-backend CORS | MEDIUM | Configure allowed origins properly |

## Follow-ups

1. **Email verification** - Add email confirmation flow on signup
2. **Password reset** - Implement forgot password functionality
3. **Rate limiting** - Add rate limiting to auth endpoints
4. **2FA support** - Add two-factor authentication option
5. **Task comments** - Allow comments on tasks
6. **Task sharing** - Enable sharing tasks with other users
7. **Real-time updates** - WebSocket for live task updates

---

**Version**: 1.0.0 | **Created**: 2026-03-14 | **Status**: Ready for /sp.tasks
