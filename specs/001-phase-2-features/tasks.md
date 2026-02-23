# Tasks: Phase-2 Features - User Authentication, Dashboard & Task Management

**Input**: Design documents from `/specs/001-phase-2-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification or if TDD approach is desired.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Full-stack web app**: `backend/src/`, `frontend/src/`
- Paths shown below assume full-stack structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend/ directory structure: src/, tests/, alembic/
- [X] T002 Create frontend/ directory structure: src/app/, src/components/, src/services/, src/context/
- [X] T003 [P] Initialize Python project: create requirements.txt with FastAPI, SQLAlchemy, bcrypt, python-jose dependencies
- [X] T004 [P] Initialize Node.js project: create package.json with Next.js, React, TypeScript, Bootstrap dependencies
- [X] T005 [P] Create .gitignore for Python and Node.js projects
- [X] T006 [P] Setup ESLint and Prettier configuration in frontend/
- [X] T007 [P] Create README.md with project overview and setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create database configuration in backend/src/core/database.py
- [X] T009 Create SQLAlchemy Base model in backend/src/models/__init__.py
- [X] T010 [P] Create Alembic configuration for database migrations
- [X] T011 [P] Implement JWT authentication utility in backend/src/core/security.py (bcrypt, JWT encode/decode)
- [X] T012 [P] Create Pydantic base schemas in backend/src/schemas/base.py
- [X] T013 [P] Setup FastAPI app with CORS middleware in backend/src/main.py
- [X] T014 [P] Create environment configuration in backend/src/core/config.py (load from .env)
- [X] T015 Create initial Alembic migration: 001_initial_schema.py (users, tasks, sessions tables)
- [X] T016 [P] Create API router structure in backend/src/api/__init__.py
- [X] T017 [P] Setup database session dependency in backend/src/core/database.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can register, login, logout, and have authenticated sessions with 7-day expiration

**Independent Test**: Can be fully tested by registering a new user, logging in, accessing a protected endpoint, and logging out

### Implementation for User Story 1

- [X] T018 [P] [US1] Create User model in backend/src/models/user.py (id, email, hashed_password, created_at)
- [X] T019 [P] [US1] Create Session model in backend/src/models/session.py (id, user_id, token_hash, expires_at)
- [X] T020 [P] [US1] Create Pydantic schemas for User in backend/src/schemas/user.py (UserCreate, UserLogin, UserResponse)
- [X] T021 [US1] Implement UserService in backend/src/services/user_service.py (create_user, authenticate_user, get_user_by_email)
- [X] T022 [US1] Implement AuthService in backend/src/services/auth_service.py (create_session, validate_token, revoke_session)
- [X] T023 [P] [US1] Create auth router in backend/src/api/auth.py (POST /register, POST /login, POST /logout)
- [X] T024 [US1] Implement password validation in backend/src/schemas/user.py (min 8 chars, uppercase, lowercase, number)
- [X] T025 [US1] Add error handling for duplicate email, invalid credentials in backend/src/api/auth.py
- [X] T026 [P] [US1] Create AuthContext in frontend/src/context/AuthContext.tsx (user state, login, logout functions)
- [X] T027 [P] [US1] Create login page in frontend/src/app/login/page.tsx
- [X] T028 [P] [US1] Create register page in frontend/src/app/register/page.tsx
- [X] T029 [US1] Create API service for auth in frontend/src/services/authService.ts (register, login, logout calls)
- [X] T030 [US1] Implement protected route wrapper in frontend/src/components/ProtectedRoute.tsx
- [X] T031 [US1] Add form validation for login/register forms in frontend/src/app/login/page.tsx and register/page.tsx
- [X] T032 [US1] Integrate frontend auth with backend API endpoints
- [X] T033 [US1] Add logging for authentication operations in backend/src/services/auth_service.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can register, login, logout

---

## Phase 4: User Story 2 - Dashboard Overview Page (Priority: P2)

**Goal**: Logged-in users can view a personalized dashboard showing task summary statistics

**Independent Test**: Can be fully tested by logging in and verifying the dashboard displays task summaries (total, pending, completed counts)

### Implementation for User Story 2

- [X] T034 [P] [US2] Create Task model in backend/src/models/task.py (id, user_id, title, description, status, due_date, created_at)
- [X] T035 [P] [US2] Create Pydantic schemas for Task in backend/src/schemas/task.py (TaskCreate, TaskUpdate, TaskResponse)
- [X] T036 [US2] Implement TaskService in backend/src/services/task_service.py (get_user_tasks, get_task_stats)
- [X] T037 [US2] Create dashboard router in backend/src/api/dashboard.py (GET /dashboard with task summary)
- [X] T038 [US2] Implement task statistics calculation in backend/src/services/task_service.py (total, pending, in_progress, completed, overdue)
- [X] T039 [P] [US2] Create dashboard page in frontend/src/app/dashboard/page.tsx
- [X] T040 [P] [US2] Create StatsCard component in frontend/src/components/StatsCard.tsx
- [X] T041 [US2] Create API service for dashboard in frontend/src/services/dashboardService.ts
- [X] T042 [US2] Implement empty state component in frontend/src/components/EmptyState.tsx (for users with no tasks)
- [ ] T043 [US2] Add navigation from dashboard to task management page
- [ ] T044 [US2] Add loading states and error handling for dashboard API calls
- [X] T045 [US2] Add logging for dashboard operations in backend/src/services/task_service.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can auth and view dashboard

---

## Phase 5: User Story 3 - Task Creation and Management (Priority: P3)

**Goal**: Users can create, view, update, and delete tasks with title, description, status, and due date

**Independent Test**: Can be fully tested by creating a task, editing its properties, marking it complete, and deleting it

### Implementation for User Story 3

- [ ] T046 [US3] Extend TaskService with CRUD operations (create_task, update_task, delete_task, get_task_by_id)
- [X] T047 [P] [US3] Create task router in backend/src/api/tasks.py (GET /tasks, POST /tasks, GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id})
- [ ] T048 [US3] Implement data isolation - all queries filter by user_id in backend/src/services/task_service.py
- [ ] T049 [US3] Add validation for future due date in backend/src/schemas/task.py
- [ ] T050 [US3] Add confirmation logic for task deletion in backend/src/api/tasks.py
- [ ] T051 [P] [US3] Create task list page in frontend/src/app/tasks/page.tsx
- [ ] T052 [P] [US3] Create TaskCard component in frontend/src/components/TaskCard.tsx
- [ ] T053 [P] [US3] Create TaskForm component for create/edit in frontend/src/components/TaskForm.tsx
- [ ] T054 [US3] Create API service for tasks in frontend/src/services/taskService.ts
- [ ] T055 [US3] Implement task list display with title, status, due date, created_at
- [ ] T056 [US3] Add create task modal/page with form validation
- [ ] T057 [US3] Add edit task functionality (inline or modal)
- [ ] T058 [US3] Add delete task with confirmation dialog
- [ ] T059 [US3] Add status update (pending, in_progress, completed) on task cards
- [ ] T060 [US3] Add success/error toast notifications for task operations
- [ ] T061 [US3] Add logging for task CRUD operations in backend/src/services/task_service.py

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - full task management available

---

## Phase 6: User Story 4 - Task Filtering and Organization (Priority: P4)

**Goal**: Users can filter and organize tasks by status, due date, or other criteria

**Independent Test**: Can be fully tested by applying different filters and verifying the task list updates accordingly

### Implementation for User Story 4

- [ ] T062 [US4] Extend TaskService with filter/sort methods (filter_by_status, sort_by_date, sort_by_created)
- [ ] T063 [P] [US4] Update GET /tasks endpoint with query params in backend/src/api/tasks.py (status, sort_by, order)
- [ ] T064 [US4] Add query parameter validation in backend/src/api/tasks.py
- [ ] T065 [P] [US4] Create filter controls component in frontend/src/components/TaskFilters.tsx
- [ ] T066 [P] [US4] Create sort dropdown component in frontend/src/components/TaskSort.tsx
- [ ] T067 [US4] Implement filter state management in frontend/src/app/tasks/page.tsx
- [ ] T068 [US4] Connect filter/sort UI to API calls in frontend/src/services/taskService.ts
- [ ] T069 [US4] Add visual indicators for active filters and sort order
- [ ] T070 [US4] Add URL query params for filter state persistence
- [ ] T071 [US4] Add logging for filter/sort operations in backend/src/services/task_service.py

**Checkpoint**: All user stories should now be independently functional - full task management with filtering

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T072 [P] Create backend requirements.txt with all dependencies pinned to specific versions
- [ ] T073 [P] Create frontend package.json with all dependencies pinned to specific versions
- [ ] T074 [P] Create .env.example files for backend and frontend with all required environment variables
- [ ] T075 Update quickstart.md with verified setup steps
- [ ] T076 [P] Add API documentation annotations in backend/src/api/*.py (OpenAPI descriptions)
- [ ] T077 [P] Create basic styling theme in frontend/src/styles/globals.css
- [ ] T078 [P] Add responsive design for mobile devices in frontend components
- [ ] T079 Code cleanup - remove unused imports, fix linting errors
- [ ] T080 [P] Add rate limiting middleware in backend/src/core/middleware.py
- [ ] T081 [P] Setup password reset email service in backend/src/services/email_service.py (SMTP configuration)
- [ ] T082 [P] Create password reset endpoint in backend/src/api/auth.py (POST /auth/password-reset)
- [ ] T083 [P] Add password reset request page in frontend/src/app/password-reset/page.tsx
- [ ] T084 [P] Run full integration test: register → login → dashboard → create task → filter tasks → logout
- [ ] T085 [P] Verify all edge cases from spec.md are handled (session expiry, data isolation, validation errors)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for auth context
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 for Task model
- **User Story 4 (P4)**: Can start after US3 - Extends task list with filters

### Within Each User Story

- Models before services
- Services before endpoints
- Backend before frontend integration
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Frontend pages/components marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create User model in backend/src/models/user.py"
Task: "Create Session model in backend/src/models/session.py"

# Launch all schemas for User Story 1 together:
Task: "Create Pydantic schemas for User in backend/src/schemas/user.py"

# Launch all frontend pages for User Story 1 together:
Task: "Create login page in frontend/src/app/login/page.tsx"
Task: "Create register page in frontend/src/app/register/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (register → login → logout flow)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Authentication!)
3. Add User Story 2 → Test independently → Deploy/Demo (Dashboard)
4. Add User Story 3 → Test independently → Deploy/Demo (Task CRUD)
5. Add User Story 4 → Test independently → Deploy/Demo (Filtering)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication)
   - Developer B: User Story 2 (Dashboard) - after US1 auth context ready
   - Developer C: User Story 3 (Task CRUD) - after US2 Task model ready
3. Developer D: User Story 4 (Filtering) - after US3 task list ready
4. Stories complete and integrate independently

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 7 tasks |
| Phase 2 | Foundational | 10 tasks |
| Phase 3 | User Story 1 (Auth) | 16 tasks |
| Phase 4 | User Story 2 (Dashboard) | 12 tasks |
| Phase 5 | User Story 3 (Task CRUD) | 16 tasks |
| Phase 6 | User Story 4 (Filtering) | 10 tasks |
| Phase 7 | Polish | 14 tasks |
| **Total** | | **85 tasks** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

