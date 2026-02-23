# Quickstart Guide

**Branch**: `001-phase-2-features` | **Date**: 2026-02-22

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

---

## Backend Setup

### 1. Clone and Navigate

```bash
cd phase-2
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Set Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hackathon2_phase2

# JWT Settings
SECRET_KEY=your-secret-key-here-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourapp.com

# Application
ENVIRONMENT=development
DEBUG=True
```

Generate a secure SECRET_KEY:
```bash
openssl rand -hex 32
```

### 5. Set Up Database

```bash
# Create database
createdb hackathon2_phase2

# Run migrations
cd backend
alembic upgrade head
```

### 6. Run Backend Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

## Frontend Setup

### 1. Navigate to Frontend

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Run Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## Running Tests

### Backend Tests

```bash
cd backend
pytest                      # Run all tests
pytest -v                   # Verbose output
pytest --cov=src            # With coverage
pytest tests/unit/          # Unit tests only
pytest tests/integration/   # Integration tests only
```

### Frontend Tests

```bash
cd frontend
npm test                    # Run tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode
```

---

## Development Workflow

### 1. Start Database

Ensure PostgreSQL is running:
```bash
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql

# Or check if running
pg_isready
```

### 2. Start Backend

```bash
cd backend
source ../venv/bin/activate  # Activate venv
uvicorn src.main:app --reload
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Verify Setup

1. Visit `http://localhost:3000` - Frontend home
2. Visit `http://localhost:8000/docs` - API documentation
3. Try registering a new user
4. Create a task

---

## Common Issues

### Database Connection Error

```
Error: Could not connect to database
```

**Solution**: 
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -l | grep hackathon2_phase2`

### Port Already in Use

```
Error: Address already in use
```

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000
# Kill process
kill -9 <PID>
```

### Module Not Found (Python)

```
ModuleNotFoundError: No module named xyz
```

**Solution**:
```bash
# Ensure venv is activated
source venv/bin/activate
# Reinstall dependencies
pip install -r requirements.txt
```

### npm Install Fails

```
Error: EACCES or permission denied
```

**Solution**:
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Project Structure

```
phase-2/
├── backend/
│   ├── src/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── api/              # API routers
│   │   ├── services/         # Business logic
│   │   └── core/             # Config, security, db
│   ├── tests/
│   ├── alembic/              # Database migrations
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   └── context/          # Auth context
│   ├── tests/
│   ├── package.json
│   └── .env.local
└── specs/001-phase-2-features/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    └── contracts/
```

---

## Next Steps

1. **Read API Docs**: Visit `http://localhost:8000/docs` for interactive API documentation
2. **Review Spec**: See `specs/001-phase-2-features/spec.md` for requirements
3. **Check Tasks**: Run `/sp.tasks` to generate implementation tasks
4. **Start Coding**: Begin with authentication endpoints (P1 priority)

---

## Useful Commands

```bash
# Backend
cd backend
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head                               # Run migrations
alembic downgrade -1                               # Rollback migration

# Frontend
cd frontend
npm run build          # Production build
npm run lint           # Run ESLint
npm run format         # Run Prettier
```
