---

description: "Task list for Phase-2 Todo Full-Stack Application Completion"
---

# Tasks: Phase-2 Todo Application Completion

**Input**: Design documents from `/specs/phase-2-completion/plan.md`
**Prerequisites**: plan.md (complete), spec.md (to be created)

**Tests**: MANDATORY per constitution - Test-First principle must be followed
**Organization**: Tasks organized by user story for independent MVP delivery

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1=Auth, US2=Dashboard, US3=Tasks CRUD)
- File paths: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and test framework setup

- [ ] T001 [P] Create pytest configuration in `backend/pytest.ini` with asyncio support
- [ ] T002 [P] Create Jest configuration in `frontend/jest.config.js` with TypeScript support
- [ ] T003 [P] Create backend test directories: `backend/tests/unit/`, `backend/tests/integration/`, `backend/tests/contract/`
- [ ] T004 [P] Create frontend test directories: `frontend/tests/components/`, `frontend/tests/pages/`
- [ ] T005 [P] Create `backend/tests/conftest.py` with test database fixture and test client
- [ ] T006 [P] Create `frontend/tests/setup.ts` with Testing Library configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 [P] Create Alembic migration for `users` table in `alembic/versions/001_create_users.py`
- [ ] T008 [P] Create Alembic migration for `tasks` table in `alembic/versions/002_create_tasks.py`
- [ ] T009 [P] Create Alembic migration for `sessions` table in `alembic/versions/003_create_sessions.py`
- [ ] T010 Run `alembic upgrade head` to apply all migrations to Neon database
- [ ] T011 [P] Create contract test for auth endpoints in `backend/tests/contract/test_auth.py`
- [ ] T012 [P] Create contract test for tasks endpoints in `backend/tests/contract/test_tasks.py`
- [ ] T013 [P] Create integration test helper in `backend/tests/integration/conftest.py`
- [ ] T014 [P] Create frontend API test utilities in `frontend/tests/utils/apiMock.ts`
- [ ] T015 Add `GET /api/auth/me` endpoint in `backend/src/api/auth.py` for getting current user from token

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Users can register, login, logout, and access authenticated routes

**Independent Test**: Can register → login → access protected endpoint → logout

### Tests for User Story 1 (Test-First - Write FIRST, Verify FAIL) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] Unit test for `UserService.create_user()` in `backend/tests/unit/test_user_service.py`
- [ ] T017 [P] [US1] Unit test for `UserService.authenticate_user()` in `backend/tests/unit/test_user_service.py`
- [ ] T018 [P] [US1] Unit test for `AuthService.create_session()` in `backend/tests/unit/test_auth_service.py`
- [ ] T019 [P] [US1] Unit test for `AuthService.validate_token()` in `backend/tests/unit/test_auth_service.py`
- [ ] T020 [P] [US1] Integration test for POST `/api/auth/register` in `backend/tests/integration/test_auth.py`
- [ ] T021 [P] [US1] Integration test for POST `/api/auth/login` in `backend/tests/integration/test_auth.py`
- [ ] T022 [P] [US1] Integration test for POST `/api/auth/logout` in `backend/tests/integration/test_auth.py`
- [ ] T023 [P] [US1] Integration test for GET `/api/auth/me` in `backend/tests/integration/test_auth.py`
- [ ] T024 [P] [US1] Component test for LoginForm in `frontend/tests/components/LoginForm.test.tsx`
- [ ] T025 [P] [US1] Component test for RegisterForm in `frontend/tests/components/RegisterForm.test.tsx`

### Implementation for User Story 1

- [ ] T026 [P] [US1] Add `email` field to JWT token payload in `backend/src/core/security.py`
- [ ] T027 [US1] Add password strength meter component in `frontend/src/components/PasswordStrength.tsx`
- [ ] T028 [US1] Add form validation feedback in `frontend/src/app/login/page.tsx`
- [ ] T029 [US1] Add form validation feedback in `frontend/src/app/register/page.tsx`
- [ ] T030 [US1] Add error toast notifications in `frontend/src/components/Toast.tsx`
- [ ] T031 [US1] Update `authService.ts` to handle email in JWT token in `frontend/src/services/authService.ts`
- [ ] T032 [US1] Add loading states with spinners in login/register pages
- [ ] T033 [US1] Add rate limiting dependency and configuration in `backend/requirements.txt`
- [ ] T034 [US1] Implement rate limiting on auth endpoints in `backend/src/api/auth.py`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- User can register with validation
- User can login and get JWT token
- User can access protected `/api/auth/me` endpoint
- User can logout
- All tests passing

---

## Phase 4: User Story 2 - Dashboard View (Priority: P2)

**Goal**: Users can view task statistics and recent tasks on dashboard

**Independent Test**: Logged-in user can access dashboard and see task counts + recent tasks

### Tests for User Story 2 (Test-First - Write FIRST, Verify FAIL) ⚠️

- [ ] T035 [P] [US2] Unit test for `TaskService.get_task_stats()` in `backend/tests/unit/test_task_service.py`
- [ ] T036 [P] [US2] Unit test for `TaskService.get_recent_tasks()` in `backend/tests/unit/test_task_service.py`
- [ ] T037 [P] [US2] Integration test for GET `/api/dashboard` in `backend/tests/integration/test_dashboard.py`
- [ ] T038 [P] [US2] Component test for StatsCard in `frontend/tests/components/StatsCard.test.tsx`
- [ ] T039 [P] [US2] Component test for DashboardPage in `frontend/tests/pages/DashboardPage.test.tsx`

### Implementation for User Story 2

- [ ] T040 [P] [US2] Add overdue tasks calculation in `TaskService.get_task_stats()` in `backend/src/services/task_service.py`
- [ ] T041 [US2] Add dashboard service type definitions in `frontend/src/services/dashboardService.ts`
- [ ] T042 [US2] Add loading skeleton for dashboard in `frontend/src/components/DashboardSkeleton.tsx`
- [ ] T043 [US2] Add error boundary for dashboard in `frontend/src/components/DashboardError.tsx`
- [ ] T044 [US2] Improve dashboard responsive design for mobile in `frontend/src/app/dashboard/page.tsx`
- [ ] T045 [US2] Add "no tasks" empty state with CTA in dashboard

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Authentication works (US1)
- Dashboard shows stats and recent tasks (US2)

---

## Phase 5: User Story 3 - Task Management CRUD (Priority: P1) 🎯 MVP

**Goal**: Users can create, view, update, and delete tasks

**Independent Test**: User can create task → view in list → edit → delete

### Tests for User Story 3 (Test-First - Write FIRST, Verify FAIL) ⚠️

- [ ] T046 [P] [US3] Unit test for `TaskService.create_task()` in `backend/tests/unit/test_task_service.py`
- [ ] T047 [P] [US3] Unit test for `TaskService.get_user_tasks()` in `backend/tests/unit/test_task_service.py`
- [ ] T048 [P] [US3] Unit test for `TaskService.get_task_by_id()` in `backend/tests/unit/test_task_service.py`
- [ ] T049 [P] [US3] Unit test for `TaskService.update_task()` in `backend/tests/unit/test_task_service.py`
- [ ] T050 [P] [US3] Unit test for `TaskService.delete_task()` in `backend/tests/unit/test_task_service.py`
- [ ] T051 [P] [US3] Integration test for POST `/api/tasks` in `backend/tests/integration/test_tasks.py`
- [ ] T052 [P] [US3] Integration test for GET `/api/tasks` in `backend/tests/integration/test_tasks.py`
- [ ] T053 [P] [US3] Integration test for GET `/api/tasks/{id}` in `backend/tests/integration/test_tasks.py`
- [ ] T054 [P] [US3] Integration test for PUT `/api/tasks/{id}` in `backend/tests/integration/test_tasks.py`
- [ ] T055 [P] [US3] Integration test for DELETE `/api/tasks/{id}` in `backend/tests/integration/test_tasks.py`
- [ ] T056 [P] [US3] Contract tests for all task endpoints in `backend/tests/contract/test_tasks.py`
- [ ] T057 [P] [US3] Component test for TaskForm in `frontend/tests/components/TaskForm.test.tsx`
- [ ] T058 [P] [US3] Component test for TaskList in `frontend/tests/components/TaskList.test.tsx`
- [ ] T059 [P] [US3] Component test for TaskItem in `frontend/tests/components/TaskItem.test.tsx`
- [ ] T060 [P] [US3] Page test for TasksPage in `frontend/tests/pages/TasksPage.test.tsx`

### Implementation for User Story 3

- [ ] T061 [P] [US3] Create `taskService.ts` in `frontend/src/services/taskService.ts` with all API methods
- [ ] T062 [P] [US3] Create Task TypeScript interfaces in `frontend/src/types/task.ts`
- [ ] T063 [P] [US3] Create TaskList component in `frontend/src/components/TaskList.tsx`
- [ ] T064 [P] [US3] Create TaskItem component in `frontend/src/components/TaskItem.tsx`
- [ ] T065 [P] [US3] Create TaskForm component (create/edit mode) in `frontend/src/components/TaskForm.tsx`
- [ ] T066 [P] [US3] Create TaskModal component for task details in `frontend/src/components/TaskModal.tsx`
- [ ] T067 [US3] Create Tasks page with list view in `frontend/src/app/tasks/page.tsx`
- [ ] T068 [US3] Add create task modal/page in `frontend/src/app/tasks/new/page.tsx`
- [ ] T069 [US3] Add edit task functionality in `frontend/src/app/tasks/[id]/edit/page.tsx`
- [ ] T070 [US3] Add delete confirmation dialog in `frontend/src/components/DeleteConfirmModal.tsx`
- [ ] T071 [US3] Add status filter dropdown in Tasks page
- [ ] T072 [US3] Add sorting options (by created_at, due_date, status) in Tasks page
- [ ] T073 [US3] Add due date picker component in `frontend/src/components/DatePicker.tsx`
- [ ] T074 [US3] Add task status badge styling in `frontend/src/components/TaskStatusBadge.tsx`
- [ ] T075 [US3] Add empty state for no tasks in `frontend/src/components/TaskEmptyState.tsx`
- [ ] T076 [US3] Add loading skeleton for task list in `frontend/src/components/TaskListSkeleton.tsx`
- [ ] T077 [US3] Add error handling and retry for task operations
- [ ] T078 [US3] Add success/error toast notifications for task CRUD operations
- [ ] T079 [US3] Add navigation from dashboard to tasks page
- [ ] T080 [US3] Update ProtectedRoute to include tasks page

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently
- Full authentication flow (US1)
- Dashboard with stats (US2)
- Complete task CRUD operations (US3)

---

## Phase 6: User Story 4 - Task Filtering & Search (Priority: P3)

**Goal**: Users can filter tasks by status and search by title

**Independent Test**: User can filter tasks by status and search results update in real-time

### Tests for User Story 4 (Test-First - Write FIRST, Verify FAIL) ⚠️

- [ ] T081 [P] [US4] Integration test for GET `/api/tasks?status=pending` in `backend/tests/integration/test_tasks.py`
- [ ] T082 [P] [US4] Integration test for GET `/api/tasks?search=query` in `backend/tests/integration/test_tasks.py`
- [ ] T083 [P] [US4] Component test for TaskFilter in `frontend/tests/components/TaskFilter.test.tsx`
- [ ] T084 [P] [US4] Component test for TaskSearch in `frontend/tests/components/TaskSearch.test.tsx`

### Implementation for User Story 4

- [ ] T085 [P] [US4] Add search query parameter support in `TaskService.get_user_tasks()` in `backend/src/services/task_service.py`
- [ ] T086 [US4] Add search filter to GET `/api/tasks` endpoint in `backend/src/api/tasks.py`
- [ ] T087 [US4] Create TaskFilter component in `frontend/src/components/TaskFilter.tsx`
- [ ] T088 [US4] Create TaskSearch component in `frontend/src/components/TaskSearch.tsx`
- [ ] T089 [US4] Add debounced search functionality in Tasks page
- [ ] T090 [US4] Add filter state management in Tasks page

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T091 [P] Create README.md with setup instructions in `README.md`
- [ ] T092 [P] Create `.env.local.example` for frontend in `frontend/.env.local.example`
- [ ] T093 [P] Create Dockerfile for backend in `backend/Dockerfile`
- [ ] T094 [P] Create Dockerfile for frontend in `frontend/Dockerfile`
- [ ] T095 [P] Create docker-compose.yml in `docker-compose.yml`
- [ ] T096 [P] Add API documentation link in frontend navigation
- [ ] T097 Code cleanup - remove unused imports, fix linting errors
- [ ] T098 Add TypeScript strict mode in `frontend/tsconfig.json`
- [ ] T099 Run `npm run build` and fix any build errors
- [ ] T100 Run `pytest` and ensure all tests pass with 80%+ coverage
- [ ] T101 Add test coverage badge and instructions in README
- [ ] T102 Add error logging service in `backend/src/core/logging.py`
- [ ] T103 Add request/response logging middleware
- [ ] T104 Security review - check for SQL injection, XSS vulnerabilities
- [ ] T105 Performance test - measure p95 latency for all endpoints
- [ ] T106 Add database indexes for frequently queried columns
- [ ] T107 Create production deployment guide in `docs/deployment.md`
- [ ] T108 Create backup and restore procedure in `docs/backup.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 - Auth (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 - Dashboard (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication
- **User Story 3 - Tasks CRUD (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication
- **User Story 4 - Filtering (P3)**: Can start after US3 is complete - Extends task functionality

### Within Each User Story

1. **Tests FIRST**: Write tests, ensure they FAIL before implementation
2. **Models/Types before services**: Create data structures first
3. **Services before endpoints/pages**: Business logic before presentation
4. **Core implementation before integration**: Basic functionality before enhancements
5. **Story complete before moving to next priority**: Finish one story at a time

### Parallel Opportunities

- All Setup tasks (T001-T006) can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Once Foundational phase completes:
  - Developer A: User Story 1 (Auth improvements)
  - Developer B: User Story 3 (Tasks CRUD) - **MVP Priority**
  - Developer C: User Story 2 (Dashboard enhancements)
- All tests for a user story marked [P] can run in parallel
- All models/components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 3 (Tasks CRUD)

```bash
# Launch all tests for User Story 3 together (Test-First):
Task: "Unit test for TaskService.create_task() in backend/tests/unit/test_task_service.py"
Task: "Unit test for TaskService.get_user_tasks() in backend/tests/unit/test_task_service.py"
Task: "Unit test for TaskService.update_task() in backend/tests/unit/test_task_service.py"
Task: "Integration test for POST /api/tasks in backend/tests/integration/test_tasks.py"
Task: "Integration test for GET /api/tasks in backend/tests/integration/test_tasks.py"

# Launch all core components for User Story 3 together:
Task: "Create taskService.ts in frontend/src/services/taskService.ts"
Task: "Create Task interfaces in frontend/src/types/task.ts"
Task: "Create TaskList component in frontend/src/components/TaskList.tsx"
Task: "Create TaskItem component in frontend/src/components/TaskItem.tsx"
Task: "Create TaskForm component in frontend/src/components/TaskForm.tsx"
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**MVP Definition**: User can register → login → create tasks → view tasks → logout

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T015)
3. Complete Phase 3: User Story 1 - Auth (T016-T034) - **Core auth only: T020-T023, T026-T029**
4. Complete Phase 5: User Story 3 - Tasks CRUD (T046-T080) - **Core CRUD only: T061-T067, T070, T075-T078**
5. **STOP and VALIDATE**: Test MVP end-to-end
6. Deploy/demo MVP

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → Test infrastructure ready
2. **MVP** (Auth + Tasks CRUD) → Core functionality working
3. **Enhancement** (Dashboard improvements) → Better UX
4. **Polish** (Filtering, search, performance) → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth enhancements)
   - Developer B: User Story 3 (Tasks CRUD) - **Highest Priority**
   - Developer C: User Story 2 (Dashboard)
3. After US1+US2+US3 complete:
   - Team: User Story 4 (Filtering & Search)
4. Final phase: Polish & Production Readiness

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, US3, US4) maps task to specific user story for traceability
- **Test-First MANDATORY**: Write tests before implementation, verify they fail first
- Each user story should be independently completable and testable
- Commit after each task or logical group of tasks
- Stop at checkpoints to validate story independently
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Priority**: US3 (Tasks CRUD) is highest priority after Auth foundation

---

## Quick Reference: Task IDs by Story

| Story | Test Tasks | Implementation Tasks | Total |
|-------|------------|---------------------|-------|
| US1 (Auth) | T016-T025 | T026-T034 | 19 |
| US2 (Dashboard) | T035-T039 | T040-T045 | 11 |
| US3 (Tasks CRUD) | T046-T060 | T061-T080 | 35 |
| US4 (Filtering) | T081-T084 | T085-T090 | 10 |
| **Total** | **45** | **53** | **98** |

Plus Phase 1 (6) + Phase 2 (9) + Phase 7 (18) = **131 total tasks**

---

**Version**: 1.0.0 | **Created**: 2026-03-14 | **Status**: Ready for implementation
