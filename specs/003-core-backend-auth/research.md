# Research: Phase III – Core Backend, Database Models & Authentication

**Date**: 2026-02-14
**Branch**: `003-core-backend-auth`

## Decision 1: Sync vs Async SQLAlchemy Engine

**Decision**: Use **sync** SQLAlchemy engine with psycopg2-binary for
the MVP. SQLModel 0.0.16 models and sessions work seamlessly with
sync engines. Wrap blocking DB calls in FastAPI's threadpool via
`def` route handlers (FastAPI auto-threads sync deps).

**Rationale**:
- SQLModel 0.0.16 does NOT have native async session support.
  Using async requires dropping to raw SQLAlchemy `AsyncSession`
  which breaks SQLModel's `Session` API and `.from_orm()` helpers.
- The existing Phase II backend already uses sync
  `create_engine` + `Session` — extending this is lowest risk.
- FastAPI runs sync dependencies in a threadpool, so DB calls
  do not block the event loop. Performance is adequate for a
  hackathon MVP with < 100 concurrent users.
- Neon PostgreSQL works with both psycopg2 and asyncpg. Using
  psycopg2-binary avoids the complexity of async session management.

**Alternatives Rejected**:
- **Async engine (asyncpg + AsyncSession)**: Maximum performance,
  but requires abandoning SQLModel's Session API. Too much custom
  plumbing for a 3-table MVP.
- **psycopg3 async**: Newer driver but less ecosystem support
  with SQLModel 0.0.16.

**Migration path**: If performance becomes a bottleneck, swap to
async engine in a future spec. Models remain unchanged.

---

## Decision 2: Migration Strategy — create_all vs Alembic

**Decision**: Use `SQLModel.metadata.create_all(engine)` at startup.

**Rationale**:
- `create_all` is idempotent — it issues `CREATE TABLE IF NOT EXISTS`
  under the hood. Safe to call on every server start.
- Three tables (Task, Conversation, Message) with a stable schema
  do not justify Alembic's migration file overhead.
- Reduces setup friction: no `alembic init`, no migration directory,
  no `alembic upgrade head` in deployment scripts.
- Existing Phase II already uses `create_all` in the lifespan handler.

**Alternatives Rejected**:
- **Alembic**: Correct for production schema evolution, but overkill
  for a hackathon MVP with a fixed schema. Can be added later.
- **Raw SQL migration scripts**: No ORM integration, manual and
  error-prone.

---

## Decision 3: Better Auth JWT Verification in Python

**Decision**: Use **PyJWT** (already in requirements.txt) with HS256
and the shared `BETTER_AUTH_SECRET`.

**Rationale**:
- Better Auth (Node.js) signs tokens with HS256 using
  `BETTER_AUTH_SECRET` as the symmetric key.
- PyJWT's `jwt.decode(token, secret, algorithms=["HS256"])` verifies
  signature, checks `exp` automatically, and returns the payload.
- The existing Phase II `auth.py` already uses this exact approach
  with PyJWT, extracting `userId`, `sub`, or `id` from the payload.
- User ID is always treated as `str` throughout the system.

**Alternatives Rejected**:
- **python-jose**: Heavier dependency, mostly useful for JWK/RS256.
  HS256 symmetric verification doesn't benefit from it.
- **Calling Better Auth's /api/auth/session endpoint**: Adds network
  latency and tight coupling to the Node.js frontend server.

**Token payload fields** (Better Auth HS256):
- `sub`: User ID (string) — primary claim to extract
- `userId`: Alternative claim (some Better Auth versions)
- `iat`: Issued at (Unix timestamp)
- `exp`: Expiration (Unix timestamp)

**Implementation**: Check `sub` first, then `userId`, then `id`.
Reject if none found or value is empty/null.
