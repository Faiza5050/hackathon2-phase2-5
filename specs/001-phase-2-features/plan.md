# Implementation Plan: Phase-2 Features - User Authentication, Dashboard & Task Management

**Branch**: `001-phase-2-features` | **Date**: 2026-02-22 | **Spec**: [spec.md](../spec.md)
**Input**: Feature specification for user authentication, dashboard, and task management

## Summary

Implement a full-stack web application with user authentication (email/password), personalized dashboard with task statistics, and complete task management (CRUD + filtering/sorting). The system requires a backend API, database for persistence, and frontend dashboard interface.

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript/TypeScript (frontend)
**Primary Dependencies**: FastAPI (backend API), React/Next.js (frontend), SQLAlchemy (ORM)
**Storage**: PostgreSQL (relational data for users, sessions, tasks)
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (responsive desktop/mobile)
**Project Type**: Full-stack web application (frontend + backend)
**Performance Goals**: Dashboard loads <3 seconds, API p95 <200ms, 500 concurrent users
**Constraints**: Session-based auth with 7-day expiration, data isolation per user, email-based password reset
**Scale/Scope**: MVP implementation, ~10 core API endpoints, 4 main user flows, 3 data entities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Since the constitution file contains template placeholders, the following principles apply by default:

1. **Test-First**: All features must have tests written before implementation (TDD)
2. **Data Isolation**: User tasks must be strictly isolated (FR-012, SC-005)
3. **User-Focused**: All error messages must be user-friendly (FR-014)
4. **Measurable Outcomes**: All success criteria must be verifiable (SC-001 through SC-006)

**Gate Status**: ✅ PASS - No violations

## Project Structure

### Documentation (this feature)

```text
specs/001-phase-2-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLAlchemy models (User, Task, Session)
│   ├── schemas/         # Pydantic schemas for validation
│   ├── api/             # FastAPI routers (auth, tasks, dashboard)
│   ├── services/        # Business logic (auth_service, task_service)
│   ├── core/            # Config, security, database connection
│   └── tests/           # Backend tests
└── requirements.txt

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components (login, register, dashboard, tasks)
│   ├── services/        # API client services
│   ├── hooks/           # Custom React hooks
│   ├── context/         # Auth context provider
│   └── styles/          # CSS/Bootstrap styles
└── package.json

shared/
└── types/               # Shared TypeScript types (if applicable)
```

**Structure Decision**: Full-stack web application with separate backend (FastAPI) and frontend (React/Next.js) projects. This structure provides clear separation of concerns, independent testability, and scalability.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Full-stack architecture | Authentication requires secure backend + interactive frontend | Static site cannot handle secure auth; backend-only lacks UX |
| Session management | 7-day session persistence required (FR-015) | Stateless auth insufficient for multi-day sessions |
| Email service integration | Password reset via email link required (FR-016) | No simpler alternative for secure password recovery |

## Phase 0: Research & Decisions

### Unknowns to Resolve

1. **Authentication Library**: Best practices for password hashing and session management in Python
2. **Email Service**: Options for sending password reset emails (SMTP vs third-party)
3. **Frontend State Management**: Approach for managing auth state in React
4. **Database Migrations**: Tool for schema versioning

### Research Dispatch

- Research Python password hashing best practices (bcrypt/argon2)
- Research session management patterns for FastAPI
- Research email delivery options for MVP (SMTP vs SendGrid vs Resend)
- Research React authentication patterns (context vs Redux vs Zustand)
- Research PostgreSQL schema design for user-task relationships

## Phase 1: Design Deliverables

### Data Model
- User entity with email, hashed_password, created_at
- Task entity with title, description, status, due_date, user_id (FK), created_at
- Session entity with user_id (FK), token, expires_at

### API Contracts
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- POST /api/auth/password-reset - Request password reset
- GET /api/dashboard - Dashboard statistics
- GET /api/tasks - List user tasks
- POST /api/tasks - Create task
- GET /api/tasks/{id} - Get task
- PUT /api/tasks/{id} - Update task
- DELETE /api/tasks/{id} - Delete task

### Quickstart Guide
- Backend setup and database configuration
- Frontend setup and environment variables
- Running development servers
- Running tests
