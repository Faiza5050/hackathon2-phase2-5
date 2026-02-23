# Research & Technical Decisions

**Branch**: `001-phase-2-features` | **Date**: 2026-02-22

## Purpose

Resolve all NEEDS CLARIFICATION items from the specification and establish technical best practices for Phase-2 implementation.

---

## Authentication & Security

### Decision 1: Password Hashing

**Decision**: Use `bcrypt` with cost factor of 12

**Rationale**: 
- Industry standard for password hashing
- Built-in salt generation
- Configurable work factor for future-proofing
- Well-maintained Python library (bcrypt)
- OWASP recommended

**Alternatives Considered**:
- `argon2`: More secure but less battle-tested in Python ecosystem
- `pbkdf2`: Built into Python but slower and less secure than bcrypt

---

### Decision 2: Session Management

**Decision**: JWT-based sessions with 7-day expiration, stored in HTTP-only cookies

**Rationale**:
- Stateless verification reduces database lookups
- HTTP-only cookies prevent XSS token theft
- 7-day expiration balances security and UX (per FR-015)
- Easy to invalidate on logout via cookie deletion

**Alternatives Considered**:
- Server-side sessions: More secure but requires database lookups on every request
- LocalStorage tokens: Vulnerable to XSS attacks

---

## Email Service

### Decision 3: Password Reset Email Delivery

**Decision**: Use SMTP with Gmail for MVP (free tier)

**Rationale**:
- Zero cost for MVP (<100 emails/day)
- Simple configuration
- No third-party API dependencies
- Easy to upgrade to SendGrid/Resend later

**Alternatives Considered**:
- SendGrid: Free tier (100/day), requires API integration
- Resend: Modern API, but paid service
- AWS SES: Cost-effective at scale, complex setup

---

## Frontend Architecture

### Decision 4: React State Management for Auth

**Decision**: React Context API with useReducer for auth state

**Rationale**:
- Built into React, no additional dependencies
- Sufficient for auth state (user, token, loading, error)
- Avoids over-engineering for MVP scope
- Easy to test and debug

**Alternatives Considered**:
- Redux Toolkit: Overkill for simple auth state
- Zustand: Lightweight but adds dependency
- Jotai/Recoil: Atomic state not needed for auth

---

### Decision 5: Frontend Framework

**Decision**: Next.js 14 (App Router) with TypeScript

**Rationale**:
- Built-in routing and API routes
- Server-side rendering for better performance
- TypeScript for type safety
- Active community and Vercel support
- Easy deployment options

**Alternatives Considered**:
- React (Vite): Simpler but requires manual routing setup
- Remix: Good alternative but smaller ecosystem

---

## Backend Architecture

### Decision 6: Backend Framework

**Decision**: FastAPI with Python 3.11+

**Rationale**:
- Automatic OpenAPI documentation
- Pydantic integration for validation
- Async support for performance
- Type hints for better IDE support
- Fast development speed

**Alternatives Considered**:
- Flask: Simpler but requires more boilerplate
- Django: Full-featured but heavier for MVP
- Express.js: JavaScript stack but less type safety

---

## Database

### Decision 7: ORM and Migrations

**Decision**: SQLAlchemy 2.0 (ORM) + Alembic (migrations)

**Rationale**:
- SQLAlchemy is FastAPI-compatible
- Alembic auto-generates migrations from models
- Strong typing with SQLAlchemy 2.0
- Well-documented and maintained

**Alternatives Considered**:
- Tortoise ORM: Async but less mature
- Django ORM: Tied to Django framework
- Raw SQL: More control but error-prone

---

### Decision 8: Database Schema Design

**Decision**: PostgreSQL with foreign key constraints and indexes

**Schema Overview**:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT pending,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (optional, for token blacklist)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
```

**Rationale**:
- UUIDs prevent ID enumeration attacks
- Foreign keys ensure data integrity
- Indexes on user_id for fast task lookups
- ON DELETE CASCADE cleans up user data

---

## Testing Strategy

### Decision 9: Backend Testing

**Decision**: pytest with pytest-asyncio for async tests

**Test Structure**:
- Unit tests: Services and schemas
- Integration tests: API endpoints with test database
- Contract tests: Request/response validation

**Fixtures**:
- Test database (transaction per test)
- Authenticated client (with valid token)
- Sample data factories

---

### Decision 10: Frontend Testing

**Decision**: Jest + React Testing Library

**Test Structure**:
- Unit tests: Utility functions, hooks
- Component tests: Render and interaction
- Integration tests: Page flows with MSW mocking

---

## Security Considerations

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Validate on both frontend and backend

### Rate Limiting
- Login: 5 attempts per minute per IP
- Password reset: 3 emails per hour per email
- Registration: 3 attempts per hour per IP

### Data Isolation
- All task queries include user_id filter
- Row-level security via application logic
- Never expose user IDs in error messages

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Login latency | <500ms p95 | API response time |
| Dashboard load | <3s | Full page render |
| Task CRUD | <200ms p95 | API response time |
| Concurrent users | 500 | Load test with k6 |

---

## Dependencies Summary

### Backend (requirements.txt)
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.0
alembic>=1.13.0
psycopg2-binary>=2.9.0
bcrypt>=4.1.0
python-jose[cryptography]>=3.3.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
python-multipart>=0.0.6
pytest>=7.4.0
pytest-asyncio>=0.23.0
httpx>=0.26.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "bootstrap": "^5.3.0",
    "react-bootstrap": "^2.9.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "jest": "^29.7.0",
    "msw": "^2.0.0"
  }
}
```

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Session duration | 7 days (from spec) |
| Password reset method | Email link via SMTP |
| Password hashing | bcrypt with cost 12 |
| Session storage | JWT in HTTP-only cookies |
| Email provider | Gmail SMTP for MVP |
| Frontend state | React Context API |
| Database | PostgreSQL with UUIDs |
| ORM | SQLAlchemy 2.0 + Alembic |
