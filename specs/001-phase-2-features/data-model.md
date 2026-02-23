# Data Model

**Branch**: `001-phase-2-features` | **Date**: 2026-02-22

## Overview

This document defines the data entities, relationships, and validation rules for the Phase-2 features: user authentication, dashboard, and task management.

---

## Entities

### User

Represents a registered user in the system.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| hashed_password | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Email must be unique (case-insensitive)
- Password minimum 8 characters
- Password must contain uppercase, lowercase, and number
- Email cannot be changed after registration

**Relationships**:
- One-to-Many with Task (user can have multiple tasks)
- One-to-Many with Session (user can have multiple active sessions)

---

### Task

Represents a user task with status tracking and due date.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique task identifier |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to User.id |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULLABLE | Task description |
| status | VARCHAR(50) | DEFAULT pending | Task status |
| due_date | TIMESTAMP | NULLABLE | Task due date |
| created_at | TIMESTAMP | DEFAULT NOW() | Task creation timestamp |

**Validation Rules**:
- Title required, max 255 characters
- Description optional, max 10,000 characters
- Status must be one of: pending, in_progress, completed
- Due date must be in the future (enforced on create/update)
- User must exist (foreign key constraint)

**Status Values**:
| Status | Description |
|--------|-------------|
| pending | Task created but not started |
| in_progress | Task is being worked on |
| completed | Task is finished |

**Relationships**:
- Many-to-One with User (task belongs to one user)

**State Transitions**:
```
pending → in_progress → completed
   ↓                        ↑
   └────────────────────────┘
```

---

### Session

Represents an active user session for authentication.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique session identifier |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to User.id |
| token_hash | VARCHAR(255) | NOT NULL | Hashed JWT token identifier |
| expires_at | TIMESTAMP | NOT NULL | Session expiration timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Session creation timestamp |

**Validation Rules**:
- Token hash must be unique
- Expires at must be in the future
- Session auto-deleted on user deletion (CASCADE)

**Expiration**:
- Sessions expire 7 days after creation
- Expired sessions are invalid for authentication
- Logout deletes the session record

**Relationships**:
- Many-to-One with User (session belongs to one user)

---

## Database Schema (SQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT pending CHECK (status IN (pending, in_progress, completed)),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT future_due_date CHECK (due_date IS NULL OR due_date > CURRENT_TIMESTAMP)
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_users_email ON users(email);
```

---

## SQLAlchemy Models

```python
# models/user.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
```

```python
# models/task.py
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="tasks")
    
    __table_args__ = (
        CheckConstraint("status IN (pending, in_progress, completed)", name="check_status"),
    )
```

```python
# models/session.py
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="sessions")
```

---

## Data Isolation Rules

**CRITICAL**: All task queries MUST include user_id filter

```python
# Correct: Filter by user_id
tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

# INCORRECT: No user filter (security violation)
tasks = db.query(Task).all()  # ❌ Exposes all tasks
```

**Implementation**:
- Auth middleware extracts user_id from JWT
- All task endpoints inject user_id into queries
- Unit tests verify isolation for each endpoint

---

## Migration Strategy

**Tool**: Alembic

**Initial Migration**: `001_initial_schema`
- Creates users, tasks, sessions tables
- Adds indexes and constraints
- Reversible (has downgrade)

**Future Migrations**:
- `002_add_password_reset_tokens` - If implementing token table
- `003_add_task_priority` - If adding priority field
- `004_add_user_preferences` - If adding user settings

---

## Test Data Factories

```python
# tests/factories.py
from faker import Faker
from datetime import timedelta

fake = Faker()

def create_user_factory(email=None, **kwargs):
    return User(
        email=email or fake.email(),
        hashed_password=hash_password("Test123!"),
        **kwargs
    )

def create_task_factory(user_id, status="pending", **kwargs):
    return Task(
        user_id=user_id,
        title=fake.sentence(nb_words=4),
        description=fake.paragraph(),
        status=status,
        due_date=datetime.now() + timedelta(days=7),
        **kwargs
    )
```
