# Quickstart: Phase III Core Backend

**Branch**: `003-core-backend-auth`

## Prerequisites

- Python 3.10+
- pip
- A Neon PostgreSQL database (or SQLite for local dev)

## Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your values:
#   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
#   BETTER_AUTH_SECRET=your-secret-here
#   FRONTEND_ORIGIN=http://localhost:3000

# 5. Start server
python main.py
# OR: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Verify

```bash
# Health check
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"todo-chatbot-api","database":"connected"}

# Root
curl http://localhost:8000/
# Expected: {"message":"Todo Chatbot API is running","version":"2.0.0"}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | sqlite:///./todo.db | Database connection string |
| BETTER_AUTH_SECRET | Yes | (none) | JWT signing secret (must match frontend) |
| FRONTEND_ORIGIN | No | http://localhost:3000 | CORS allowed origin |
| HOST | No | 0.0.0.0 | Server bind host |
| PORT | No | 8000 | Server bind port |

## Database

Tables are created automatically on first startup via
`SQLModel.metadata.create_all()`. No manual migration needed.

Three tables: `task`, `conversation`, `message`.
