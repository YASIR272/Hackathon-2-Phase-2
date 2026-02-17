# Implementation Plan: Phase III – Core Backend, Database Models & Authentication

**Branch**: `003-core-backend-auth` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-core-backend-auth/spec.md`

## Summary

Build the foundational Phase III FastAPI backend by extending the
existing Phase II backend with two new SQLModel models (Conversation,
Message), updating the existing Task model to match the Phase III
field spec, adding a database-aware health endpoint, and preserving
the existing Better Auth JWT integration. The backend uses a sync
SQLAlchemy engine with psycopg2 for Neon PostgreSQL, with
`create_all` for idempotent schema initialization.

## Technical Context

**Language/Version**: Python 3.10+
**Primary Dependencies**: FastAPI 0.104.1, SQLModel 0.0.16, PyJWT 2.8.0, Pydantic-Settings 2.1.0, Uvicorn 0.24.0
**Storage**: Neon Serverless PostgreSQL (production), SQLite (development)
**Testing**: pytest + httpx (TestClient)
**Target Platform**: Linux server (Hugging Face Spaces), Windows (local dev)
**Project Type**: Web application (backend component)
**Performance Goals**: < 1s health check response, < 5s cold start
**Constraints**: Sync engine (SQLModel 0.0.16 compatibility), stateless server
**Scale/Scope**: < 100 concurrent users (hackathon MVP)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | All code traces to spec.md FR-001–FR-014 |
| II. Multi-User Isolation | PASS | user_id indexed on all tables, JWT auth enforced |
| III. Polished Professional UI | N/A | This spec is backend-only |
| IV. Stateless Architecture | PASS | No in-memory state; all persisted to PostgreSQL |
| V. MCP-Only Task Operations | N/A | MCP server is a separate spec |
| VI. Official SDKs Only | PASS | SQLModel, FastAPI, PyJWT — all official |
| VII. Full Reproducibility | PASS | .env.example, create_all, requirements.txt |

**Post-Phase 1 re-check**: All gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/003-core-backend-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output (3 decisions)
├── data-model.md        # Phase 1 output (3 entities)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output
│   ├── health-api.md    # Health endpoint contract
│   └── auth-dependency.md  # Auth dependency contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root — existing backend/)

```text
backend/
├── models.py            # MODIFY: Add Conversation, Message models
├── database.py          # MODIFY: Add Neon connection pooling config
├── auth.py              # KEEP: Existing JWT verification (already works)
├── config.py            # MODIFY: Add HOST, PORT settings
├── main.py              # MODIFY: Health endpoint with DB check, version bump
├── schemas.py           # KEEP: Existing task schemas
├── crud.py              # KEEP: Existing task CRUD
├── requirements.txt     # MODIFY: Add psycopg2-binary
├── .env.example         # MODIFY: Document all variables
├── routes/
│   ├── __init__.py      # KEEP
│   └── tasks.py         # KEEP: Existing task routes
└── tests/
    └── test_models.py   # NEW: Model and schema tests
```

**Structure Decision**: Extend the existing `backend/` directory
in-place. No new subdirectories (models/, database/, auth/ packages)
are needed — the existing flat module structure is simple and
adequate for Phase III. The constitution mandates smallest viable
diff; splitting into packages would be unnecessary refactoring.

**Deployment note**: The backend is already deployed on Hugging Face
Spaces. The existing folder structure, routes, and endpoints MUST
be preserved. Phase III additions (new models, updated health check)
are additive and backward-compatible.

## Key Architectural Decisions

### D1: Sync Engine with psycopg2-binary

**Decision**: Use sync `create_engine` with `psycopg2-binary` driver.

**Rationale**: SQLModel 0.0.16 lacks native async support. The
existing backend uses sync sessions. FastAPI auto-threads sync
dependencies, so DB calls don't block the event loop. Performance
is adequate for < 100 concurrent users.

**Connection string handling**:
- If `DATABASE_URL` starts with `postgresql://`, use psycopg2
  with `check_same_thread` omitted.
- If `DATABASE_URL` starts with `sqlite://`, use SQLite with
  `check_same_thread=False`.

### D2: create_all for Schema Initialization

**Decision**: Use `SQLModel.metadata.create_all(engine)` in the
FastAPI lifespan handler.

**Rationale**: Idempotent (`CREATE TABLE IF NOT EXISTS`). Three
stable tables don't justify Alembic's overhead. Already in use
by Phase II.

### D3: JWT Verification with PyJWT

**Decision**: Keep existing `auth.py` using PyJWT with HS256 and
`BETTER_AUTH_SECRET`.

**Rationale**: Already working in Phase II. Extracts `sub`,
`userId`, or `id` from token payload. Demo mode fallback preserved
for backward compatibility.

## Changes Required (Diff Summary)

### 1. models.py — Add Conversation and Message

**Current state**: Task, TaskBase, TaskRead, TaskCreate, TaskUpdate,
TaskToggleComplete models.

**Changes**:
- Add `Conversation` SQLModel table with: id, user_id, created_at,
  updated_at. Index on user_id.
- Add `Message` SQLModel table with: id, user_id, conversation_id
  (FK → Conversation.id), role, content, created_at. Index on
  user_id.
- Keep all existing Task models unchanged.

### 2. database.py — Neon Connection Pooling

**Current state**: Sync engine with SQLite default.

**Changes**:
- Add `psycopg2-binary` support for PostgreSQL URLs.
- Configure connection pool: `pool_size=5`, `max_overflow=10`,
  `pool_pre_ping=True` for Neon serverless resilience.
- Keep SQLite path for local development.

### 3. config.py — Additional Settings

**Current state**: better_auth_secret, database_url, neon_db_url,
api_prefix, frontend_origin.

**Changes**:
- Add `host: str = "0.0.0.0"` and `port: int = 8000`.
- Add `cors_origins: str = ""` for additional CORS origins.
- Keep existing fields and defaults.

### 4. main.py — Enhanced Health Check

**Current state**: Basic `/health` returning static JSON.

**Changes**:
- Health endpoint checks actual DB connectivity by executing a
  simple query (`SELECT 1`).
- Returns `"database": "connected"` or `"database": "disconnected"`.
- Update version to "2.0.0".
- Keep all existing routes and middleware.

### 5. requirements.txt — Add psycopg2-binary

**Changes**:
- Add `psycopg2-binary==2.9.9` for PostgreSQL connectivity.
- Keep all existing dependencies.

### 6. .env.example — Document All Variables

**Changes**:
- Add HOST, PORT, CORS_ORIGINS documentation.
- Improve descriptions for existing variables.

## Complexity Tracking

No Constitution Check violations. No complexity justification needed.

## Testing Strategy

- **Model tests**: Verify Task, Conversation, Message table creation
  against SQLite in-memory database.
- **Relationship tests**: Verify Message → Conversation FK enforcement.
- **Auth tests**: Verify JWT decode with valid/invalid/expired tokens.
- **Health endpoint tests**: Verify /health returns DB status.
- **Framework**: pytest + httpx TestClient (FastAPI's built-in).

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| psycopg2-binary install fails on Hugging Face | Low | High | Pin version, test in Docker |
| Existing Phase II routes break | Low | High | No existing route changes; additive only |
| Neon cold start causes health check to show disconnected | Medium | Low | pool_pre_ping=True retries connection |
