# Tasks: MCP Server and All Task Tools

**Input**: Design documents from `/specs/004-mcp-server-task-tools/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — the plan.md defines a Testing Strategy (unit + integration tests with pytest).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependency and prepare test directory structure

- [x] T001 Add `mcp>=1.0.0` dependency to `backend/requirements.txt`
- [x] T002 [P] Create test package directory with `backend/tests/__init__.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create MCP server module scaffold — MUST be complete before ANY tool can be registered

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create MCP server scaffold with FastMCP initialization, database/model imports, and stdio entry point in `backend/mcp_server.py`

**Details for T003**:
- Import `FastMCP` from `mcp.server.fastmcp`
- Import `Session` from `sqlmodel` and `engine` from `database`
- Import `Task` model from `models`
- Import `json` for response serialization
- Create `FastMCP("todo-task-server")` instance
- Add `if __name__ == "__main__": mcp.run(transport="stdio")` entry point
- Verify the module imports cleanly without errors

**Checkpoint**: MCP server module exists and can be imported — tool registration can now begin

---

## Phase 3: User Story 1 — MCP Server Discovery and Tool Listing (Priority: P1) :dart: MVP

**Goal**: An MCP client can connect, request `tools/list`, and receive all 5 tools with correct names, descriptions, and parameter schemas

**Independent Test**: Start the MCP server, connect a client, call `tools/list` — verify 5 tools returned with correct names and schemas (SC-001)

### Implementation for User Story 1

- [x] T004 [US1] Register all 5 tool functions as decorated stubs with type-hinted signatures and rich agent-oriented docstrings in `backend/mcp_server.py`

**Details for T004**:
- Register `add_task(user_id: str, title: str, description: str = "") -> str` with `@mcp.tool()`
- Register `list_tasks(user_id: str, status: str = "all") -> str` with `@mcp.tool()`
- Register `complete_task(user_id: str, task_id: int) -> str` with `@mcp.tool()`
- Register `delete_task(user_id: str, task_id: int) -> str` with `@mcp.tool()`
- Register `update_task(user_id: str, task_id: int, title: str = "", description: str = "") -> str` with `@mcp.tool()`
- Each function must have a rich docstring (purpose, usage examples, Args section) per research.md Topic 4
- Stub bodies return `json.dumps({"error": "Not implemented"})` for now
- FR-002: Exactly 5 tools registered; FR-003: Complete parameter schemas via type hints

**Checkpoint**: `tools/list` returns 5 tools with correct names and schemas — US1 is fully functional

---

## Phase 4: User Story 2 — Adding a Task via MCP Tool (Priority: P1)

**Goal**: `add_task` creates a new task in the database and returns `{"task_id": N, "status": "created", "title": "..."}`

**Independent Test**: Call `add_task` with a user_id and title, query DB to confirm task exists with correct attributes (SC-002)

### Implementation for User Story 2

- [x] T005 [US2] Implement `add_task` tool body with input validation, DB creation, and JSON response in `backend/mcp_server.py`

**Details for T005**:
- Validate `title` is not empty/whitespace and ≤255 chars; return `{"error": "Title is required"}` if invalid (FR-013)
- Create `Task(user_id=user_id, title=title, description=description)` inside `with Session(engine)` block
- `session.add(task)`, `session.commit()`, `session.refresh(task)`
- Return `json.dumps({"task_id": task.id, "status": "created", "title": task.title})`
- Scope by user_id per FR-009
- Match output schema from `contracts/mcp-tools.json` (FR-004)

**Checkpoint**: `add_task` persists tasks to DB and returns correct JSON — US2 is fully functional

---

## Phase 5: User Story 3 — Listing Tasks via MCP Tool (Priority: P1)

**Goal**: `list_tasks` retrieves user's tasks with optional status filtering and returns `[{"id": N, "title": "...", "completed": bool}, ...]`

**Independent Test**: Create tasks for a user, call `list_tasks` with each status filter ("all", "pending", "completed"), verify correct results (SC-003)

### Implementation for User Story 3

- [x] T006 [US3] Implement `list_tasks` tool body with status filtering and JSON array response in `backend/mcp_server.py`

**Details for T006**:
- Validate `status` is one of "all", "pending", "completed"; return `{"error": "Invalid status filter"}` otherwise (FR-013)
- Build query: `select(Task).where(Task.user_id == user_id)` scoped by user_id (FR-009)
- Apply filter: "pending" → `.where(Task.completed == False)`, "completed" → `.where(Task.completed == True)`, "all" → no filter
- Default to "all" when status parameter is omitted (FR-014)
- Return `json.dumps([{"id": t.id, "title": t.title, "completed": t.completed} for t in tasks])`
- Match output schema from `contracts/mcp-tools.json` (FR-005)

**Checkpoint**: `list_tasks` returns correct filtered results — US3 is fully functional

---

## Phase 6: User Story 4 — Completing a Task via MCP Tool (Priority: P2)

**Goal**: `complete_task` marks a task as done and returns `{"task_id": N, "status": "completed", "title": "..."}`

**Independent Test**: Create a pending task, call `complete_task`, verify `completed=True` in DB and correct JSON response

### Implementation for User Story 4

- [x] T007 [US4] Implement `complete_task` tool body with ownership verification and JSON response in `backend/mcp_server.py`

**Details for T007**:
- Query `select(Task).where(Task.id == task_id, Task.user_id == user_id)` — scope by user_id AND task_id (FR-009, FR-010)
- If task not found: return `json.dumps({"error": "Task not found"})` (FR-010)
- Set `task.completed = True`, `session.add(task)`, `session.commit()`
- Return `json.dumps({"task_id": task.id, "status": "completed", "title": task.title})`
- Match output schema from `contracts/mcp-tools.json` (FR-006)

**Checkpoint**: `complete_task` marks tasks done with ownership check — US4 is fully functional

---

## Phase 7: User Story 5 — Deleting a Task via MCP Tool (Priority: P2)

**Goal**: `delete_task` removes a task from the database and returns `{"task_id": N, "status": "deleted", "title": "..."}`

**Independent Test**: Create a task, call `delete_task`, verify task no longer exists in DB and correct JSON response

### Implementation for User Story 5

- [x] T008 [US5] Implement `delete_task` tool body with ownership verification and JSON response in `backend/mcp_server.py`

**Details for T008**:
- Query `select(Task).where(Task.id == task_id, Task.user_id == user_id)` — scope by user_id AND task_id (FR-009, FR-010)
- If task not found: return `json.dumps({"error": "Task not found"})` (FR-010)
- Save title before delete: `title = task.title`
- `session.delete(task)`, `session.commit()`
- Return `json.dumps({"task_id": task_id, "status": "deleted", "title": title})`
- Match output schema from `contracts/mcp-tools.json` (FR-007)

**Checkpoint**: `delete_task` removes tasks with ownership check — US5 is fully functional

---

## Phase 8: User Story 6 — Updating a Task via MCP Tool (Priority: P2)

**Goal**: `update_task` modifies a task's title and/or description and returns `{"task_id": N, "status": "updated", "title": "..."}`

**Independent Test**: Create a task, call `update_task` with new title/description, verify changes persisted in DB

### Implementation for User Story 6

- [x] T009 [US6] Implement `update_task` tool body with partial update logic, validation, and JSON response in `backend/mcp_server.py`

**Details for T009**:
- Validate at least one of `title` or `description` is provided (non-empty); return `{"error": "No fields to update"}` if both empty (FR-013)
- If `title` provided, validate ≤255 chars and not whitespace-only
- Query `select(Task).where(Task.id == task_id, Task.user_id == user_id)` — scope by user_id AND task_id (FR-009, FR-010)
- If task not found: return `json.dumps({"error": "Task not found"})` (FR-010)
- Apply partial updates: only set fields that are provided and non-empty
- `session.add(task)`, `session.commit()`, `session.refresh(task)`
- Return `json.dumps({"task_id": task.id, "status": "updated", "title": task.title})`
- Match output schema from `contracts/mcp-tools.json` (FR-008)

**Checkpoint**: `update_task` handles partial updates with ownership check — US6 is fully functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Testing, validation, and quality assurance across all tools

- [x] T010 Write unit tests for all 5 MCP tools using SQLite in-memory database in `backend/tests/test_mcp_tools.py`
- [x] T011 Write integration test for MCP server tool discovery and end-to-end tool calls via stdio in `backend/tests/test_mcp_tools.py`
- [x] T012 Validate against quickstart.md scenarios and verify all 6 success criteria (SC-001 through SC-006)

**Details for T010**:
- Create pytest fixtures: in-memory SQLite engine, override `database.engine`, seed test data
- Test `add_task`: valid creation, missing title error, user isolation
- Test `list_tasks`: all/pending/completed filters, empty list, invalid status, user isolation
- Test `complete_task`: valid completion, task not found, cross-user rejection
- Test `delete_task`: valid deletion, task not found, cross-user rejection
- Test `update_task`: title-only update, description-only, both, no fields error, task not found, cross-user rejection
- Assert all responses match JSON schemas from `contracts/mcp-tools.json`

**Details for T011**:
- Start MCP server as subprocess via `python mcp_server.py`
- Connect MCP client via stdio
- Call `tools/list` and verify all 5 tools returned (SC-001)
- Call each tool with valid params and verify response format
- Test error cases end-to-end

**Details for T012**:
- Run through quickstart.md manual verification steps
- SC-001: 5 tools discoverable with correct schemas
- SC-002: Task creation succeeds on first attempt
- SC-003: list_tasks returns accurate filtered results
- SC-004: Multi-user isolation (2+ users, zero cross-user leakage)
- SC-005: All error cases return structured JSON (no crashes)
- SC-006: Tool operations complete within 2 seconds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (mcp package must be installed) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on T003 (server scaffold) — establishes tool discovery
- **US2 (Phase 4)**: Depends on T004 (tool stubs registered) — implements add_task body
- **US3 (Phase 5)**: Depends on T004 (tool stubs registered) — implements list_tasks body
- **US4 (Phase 6)**: Depends on T004 (tool stubs registered) — implements complete_task body
- **US5 (Phase 7)**: Depends on T004 (tool stubs registered) — implements delete_task body
- **US6 (Phase 8)**: Depends on T004 (tool stubs registered) — implements update_task body
- **Polish (Phase 9)**: Depends on ALL user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — no other story dependencies
- **US2 (P1)**: Depends on US1 (stubs must be registered before implementing body)
- **US3 (P1)**: Depends on US1 — can be parallel with US2 (but same file, so sequential recommended)
- **US4 (P2)**: Depends on US1 — independent of US2, US3, US5, US6
- **US5 (P2)**: Depends on US1 — independent of US2, US3, US4, US6
- **US6 (P2)**: Depends on US1 — independent of US2, US3, US4, US5

### Within Each User Story

- Single-task stories — each tool is one task with validation + DB logic + response
- All tools share the same file (`backend/mcp_server.py`), so sequential execution recommended
- Tests come after all tools are implemented (Phase 9)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- US2–US6 are logically independent but share `backend/mcp_server.py` — sequential recommended
- T010 and T011 can be developed in sequence within the same test file
- In a multi-developer scenario: one developer implements tools (T003–T009), another prepares test scaffolding

---

## Parallel Example: Setup Phase

```bash
# Launch setup tasks in parallel (different files):
Task T001: "Add mcp>=1.0.0 to backend/requirements.txt"
Task T002: "Create backend/tests/__init__.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1–3 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational — T003 creates server scaffold
3. Complete Phase 3: US1 — T004 registers all 5 tool stubs (discovery works)
4. Complete Phase 4: US2 — T005 implements add_task
5. Complete Phase 5: US3 — T006 implements list_tasks
6. **STOP and VALIDATE**: Server starts, tools discoverable, can add and list tasks
7. This is the minimum viable MCP server for the Phase III chatbot

### Incremental Delivery

1. Setup + Foundational → Server scaffold ready
2. US1 → Tool discovery works → Verify `tools/list` returns 5 tools
3. US2 → Can add tasks → Verify tasks persist to DB
4. US3 → Can list tasks → Verify filtering works
5. US4 → Can complete tasks → Verify status toggle
6. US5 → Can delete tasks → Verify removal
7. US6 → Can update tasks → Verify partial updates
8. Polish → Tests pass, success criteria validated

### Single-Developer Recommended Flow

Since all implementation is in one file (`backend/mcp_server.py`):

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012
```

Each task builds on the previous, and the file grows incrementally.

---

## Notes

- All 5 tools operate on the EXISTING `Task` model from `backend/models.py` — no new models needed
- The MCP server shares DB engine from `backend/database.py` — no duplicate config
- All tools are stateless (FR-011): `Session(engine)` opened and closed per call
- `priority` and `due_date` fields exist on Task but are NOT exposed by MCP tools in this spec
- Error responses use `{"error": "message"}` format — agent detects errors by `"error"` key presence
- Tool return type is `str` (JSON-serialized) — FastMCP wraps as `TextContent` automatically
- Commit after each task or logical group
