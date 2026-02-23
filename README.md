# Phase-2 Features: User Authentication, Dashboard & Task Management

Full-stack web application with user authentication, personalized dashboard, and task management.

## Tech Stack

- **Backend**: FastAPI + Python 3.11+ + SQLAlchemy + PostgreSQL
- **Frontend**: Next.js 14 + React + TypeScript + Bootstrap
- **Authentication**: JWT with bcrypt password hashing
- **Database**: PostgreSQL with UUID primary keys

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
# Configure .env file with DATABASE_URL and SECRET_KEY
uvicorn src.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Specification](specs/001-phase-2-features/spec.md)
- [Technical Plan](specs/001-phase-2-features/plan.md)
- [API Contracts](specs/001-phase-2-features/contracts/api-contracts.md)
- [Quickstart Guide](specs/001-phase-2-features/quickstart.md)

## Development Status

See `specs/001-phase-2-features/tasks.md` for implementation progress.

## License

MIT
