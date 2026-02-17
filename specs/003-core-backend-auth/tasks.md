# Tasks: Phase III – Core Backend, Database Models & Authentication

**Input**: Design documents from `/specs/003-core-backend-auth/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test tasks included in Phase 6 (plan.md defines a testing strategy).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. User Stories 1–3 are all P1 and have cross-dependencies (models must exist before health check can verify DB, auth must exist before models are useful). They are ordered: US2 (models) → US1 (health) → US3 (auth verification) to respect data flow. US4 (config) is P2 and independent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` at repository root (existing Phase II structure)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update dependencies and configuration to support Phase III models and PostgreSQL connectivity.

- [x] T001 Add `psycopg2-binary==2.9.9` to `backend/requirements.txt` (keep all existing dependencies)
- [x] T002 [P] Update `backend/config.py` — add `host: str = "0.0.0.0"`, `port: int = 8000`, and `cors_origins: str = ""` fields to the Settings class, keeping all existing fields unchanged
- [x] T003 [P] Update `backend/.env.example` — add HOST, PORT, CORS_ORIGINS with descriptions; improve existing variable descriptions per quickstart.md

**Checkpoint**: Dependencies and configuration updated. `pip install -r requirements.txt` succeeds.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database engine must support PostgreSQL before models can be created and tested.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Update `backend/database.py` — detect PostgreSQL vs SQLite from DATABASE_URL; configure connection pool (`pool_size=5`, `max_overflow=10`, `pool_pre_ping=True`) for PostgreSQL URLs; keep `check_same_thread=False` for SQLite only; keep existing `get_session()` generator unchanged

**Checkpoint**: Foundation ready — `database.py` correctly creates engine for both SQLite and PostgreSQL URLs.

---

## Phase 3: User Story 2 — Database Models & Schema Creation (Priority: P1) MVP

**Goal**: Define Conversation and Message SQLModel models with exact fields from Phase III requirements. Task model already exists and stays unchanged.

**Independent Test**: Start server → verify `conversation` and `message` tables are created with correct columns, indexes, and FK relationship.

### Implementation for User Story 2

- [ ] T005 [US2] Add `Conversation` model to `backend/models.py` — SQLModel table with fields: `id` (Optional[int], PK, auto), `user_id` (str, indexed), `created_at` (datetime, server_default CURRENT_TIMESTAMP), `updated_at` (datetime, server_default CURRENT_TIMESTAMP, onupdate). Add `__table_args__` with Index on `user_id`.
- [ ] T006 [US2] Add `Message` model to `backend/models.py` — SQLModel table with fields: `id` (Optional[int], PK, auto), `user_id` (str, indexed), `conversation_id` (int, Foreign Key → Conversation.id), `role` (str, "user" or "assistant"), `content` (str, Text column), `created_at` (datetime, server_default CURRENT_TIMESTAMP). Add `__table_args__` with Index on `user_id`.
- [ ] T007 [US2] Verify `backend/main.py` lifespan handler — confirm `SQLModel.metadata.create_all(bind=engine)` already discovers new Conversation and Message models (they are imported transitively via models.py). Add explicit `import models` if not already present in main.py to ensure all models are registered.

**Checkpoint**: Server starts, `conversation` and `message` tables exist alongside `task` table. FK from message.conversation_id → conversation.id is enforced.

---

## Phase 4: User Story 1 — Server Health Check (Priority: P1)

**Goal**: Upgrade the existing `/health` endpoint to check actual database connectivity and return structured status.

**Independent Test**: `curl http://localhost:8000/health` returns `{"status":"healthy","service":"todo-chatbot-api","database":"connected"}`.

### Implementation for User Story 1

- [ ] T008 [US1] Update `GET /health` in `backend/main.py` — replace static JSON response with a handler that executes `SELECT 1` via a database session to verify connectivity; return `{"status":"healthy","service":"todo-chatbot-api","database":"connected"}` on success or `{"status":"degraded","service":"todo-chatbot-api","database":"disconnected"}` on failure; keep endpoint unauthenticated
- [ ] T009 [US1] Update `GET /` root endpoint in `backend/main.py` — change response to `{"message":"Todo Chatbot API is running","version":"2.0.0"}` per health-api.md contract
- [ ] T010 [US1] Add database error handler in `backend/main.py` — catch SQLAlchemy `OperationalError` in a global exception handler and return 503 with `{"detail":"Database temporarily unavailable"}` instead of crashing

**Checkpoint**: Health check reports real DB status. Server survives DB disconnection gracefully.

---

## Phase 5: User Story 3 — Authentication & User Context (Priority: P1)

**Goal**: Verify existing auth.py already satisfies Phase III requirements. Add null/empty user_id rejection if missing.

**Independent Test**: Send request with valid JWT → get correct user_id; send invalid/expired/missing token → get 401.

### Implementation for User Story 3

- [ ] T011 [US3] Review `backend/auth.py` `verify_token()` — confirm it extracts `sub`, `userId`, `id` from JWT payload using PyJWT with HS256 and `BETTER_AUTH_SECRET`; confirm it raises 401 for expired and invalid tokens. No changes expected (already working from Phase II).
- [ ] T012 [US3] Update `backend/auth.py` `verify_token()` — add validation that extracted user_id is not empty string or None; if empty/null, raise HTTPException 401 with detail "Invalid user identity" per auth-dependency.md contract
- [ ] T013 [US3] Review `backend/auth.py` `get_current_user_id()` — confirm demo-mode fallback (`"demo-user"`) is preserved for backward compatibility with Phase II unauthenticated requests. No changes expected.

**Checkpoint**: Auth dependency correctly extracts user_id as string, rejects empty/null, preserves demo mode fallback.

---

## Phase 6: User Story 4 — Environment Configuration (Priority: P2)

**Goal**: Ensure all configuration is environment-driven with clear documentation.

**Independent Test**: Start server with different .env configurations (SQLite, PostgreSQL) and verify correct behavior.

### Implementation for User Story 4

- [ ] T014 [US4] Update `backend/main.py` `uvicorn.run()` call — use `settings.host` and `settings.port` from config instead of hardcoded values
- [ ] T015 [US4] Update CORS middleware in `backend/main.py` — parse `settings.cors_origins` (comma-separated string) and add to allow_origins list alongside existing hardcoded origins

**Checkpoint**: Server respects HOST, PORT, CORS_ORIGINS from environment. .env.example documents all variables.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation, smoke testing, and documentation.

- [ ] T016 [P] Verify all existing Phase II routes still work — start server, confirm `GET /api/{user_id}/tasks` returns tasks, `POST /api/{user_id}/tasks` creates task (backward compatibility check)
- [ ] T017 [P] Run server startup test against SQLite — `python backend/main.py` starts without errors, `/health` returns `database: connected`, Ctrl+C shuts down cleanly
- [ ] T018 Verify `Conversation` and `Message` tables are created — start server, check SQLite file or PostgreSQL catalog for `conversation` and `message` tables with correct columns and indexes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (psycopg2-binary in requirements) — BLOCKS all user stories
- **US2 Models (Phase 3)**: Depends on Phase 2 (database.py must handle PostgreSQL)
- **US1 Health (Phase 4)**: Depends on Phase 3 (needs DB session for connectivity check)
- **US3 Auth (Phase 5)**: No dependency on US1 or US2 (auth.py is independent) — CAN run in parallel with Phase 3/4
- **US4 Config (Phase 6)**: Depends on Phase 1 (config.py must have new fields) — CAN run in parallel with Phase 3/4/5
- **Polish (Phase 7)**: Depends on all user stories being complete

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002 and T003 can run in parallel (different files: config.py, .env.example)
- T005 and T006 are sequential (both in models.py, Message depends on Conversation)
- US3 (Phase 5) can run in parallel with US2 (Phase 3) — different files (auth.py vs models.py)
- US4 (Phase 6) can run in parallel with US1 (Phase 4) — config changes vs health endpoint
- T016 and T017 can run in parallel (independent validation checks)

---

## Parallel Example: Setup Phase

```bash
# Launch in parallel (different files):
Task T002: "Update config.py with host, port, cors_origins settings"
Task T003: "Update .env.example with all variable documentation"
```

## Parallel Example: User Stories

```bash
# After Phase 2 completes, these can run in parallel:
# Stream 1: US2 (models.py) → US1 (main.py health check)
# Stream 2: US3 (auth.py) — independent file
# Stream 3: US4 (main.py config) — wait for US1 to finish main.py edits
```

---

## Implementation Strategy

### MVP First (User Story 2 + 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: User Story 2 — Models (T005–T007)
4. Complete Phase 4: User Story 1 — Health Check (T008–T010)
5. **STOP and VALIDATE**: Start server, verify tables created, health check works
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US2 (Models) → Verify tables → Database ready
3. Add US1 (Health) → Verify health endpoint → Monitoring ready
4. Add US3 (Auth) → Verify JWT flows → Security ready
5. Add US4 (Config) → Verify env vars → Deployment ready
6. Polish → Full validation → Release ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All changes are **additive** — no existing Phase II code is deleted
- Existing routes, models, and schemas are preserved unchanged
- T011 and T013 are **review tasks** — verify existing code satisfies requirements, make changes only if needed
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
