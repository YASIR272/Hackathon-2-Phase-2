# Implementation Plan: MCP Server and All Task Tools

**Branch**: `004-mcp-server-task-tools` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-mcp-server-task-tools/spec.md`

## Summary

Build a standalone MCP server using the official MCP Python SDK (`mcp` package,
`FastMCP` high-level API) that registers five stateless task-management tools
(add_task, list_tasks, complete_task, delete_task, update_task). Each tool
operates on the shared SQLModel/SQLAlchemy database from Spec 1, scopes all
queries by user_id, and returns JSON responses matching the Phase III
requirements. The server uses stdio transport for agent integration.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: `mcp` (official MCP Python SDK, >=1.0.0), SQLModel 0.0.16, SQLAlchemy (via SQLModel)
**Storage**: Shared SQLModel engine from `backend/database.py` (Neon PostgreSQL / SQLite)
**Testing**: pytest with SQLite in-memory for unit tests, MCP client for integration tests
**Target Platform**: Linux server / Windows dev (co-located with FastAPI backend)
**Project Type**: Web application backend module
**Performance Goals**: <2s per tool call under normal load
**Constraints**: Must use official MCP SDK only; stdio transport; stateless tools; shared DB engine
**Scale/Scope**: 5 tools, 1 entity (Task), single MCP server module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | Plan follows spec.md FR-001 through FR-014 |
| II. Multi-User Isolation | PASS | All tools scope by user_id (FR-009); ownership check before mutation (FR-010) |
| III. Polished Professional UI | N/A | No UI in this spec |
| IV. Stateless Architecture | PASS | Tools are stateless, DB-only state (FR-011) |
| V. MCP-Only Task Operations | PASS | All 5 required tools registered (FR-002) |
| VI. Official SDKs Only | PASS | Using `mcp` package (official SDK); `FastMCP` is part of official SDK at `mcp.server.fastmcp` |
| VII. Full Reproducibility | PASS | `mcp` added to requirements.txt; env-driven config |

**Gate result: PASS** — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-mcp-server-task-tools/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (MCP tool schemas)
│   └── mcp-tools.json   # JSON Schema for all 5 tools
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── config.py            # [EXISTING] Settings, shared by FastAPI + MCP
├── database.py          # [EXISTING] Engine + get_session, shared by FastAPI + MCP
├── models.py            # [EXISTING] Task, Conversation, Message models
├── crud.py              # [EXISTING] CRUD functions (FastAPI routes use these)
├── auth.py              # [EXISTING] JWT verification for FastAPI
├── main.py              # [EXISTING] FastAPI app
├── mcp_server.py        # [NEW] MCP server with 5 tool registrations
├── requirements.txt     # [MODIFIED] Add `mcp` dependency
├── routes/
│   └── tasks.py         # [EXISTING] FastAPI task routes
└── tests/
    └── test_mcp_tools.py  # [NEW] Unit + integration tests for MCP tools
```

**Structure Decision**: The MCP server is a single new file (`mcp_server.py`) in the
existing `backend/` directory. It imports `database.engine` and `models.Task` directly,
sharing the DB connection. No new directories needed beyond `tests/`.

## Key Decisions

### Decision 1: FastMCP (High-Level) vs Low-Level Server API

**Chosen**: FastMCP (`mcp.server.fastmcp.FastMCP`)

**Rationale**:
- FastMCP IS the official SDK — it lives at `mcp.server.fastmcp` inside the `mcp` package
- Auto-generates JSON Schema from Python type hints (less boilerplate)
- `@mcp.tool()` decorator is cleaner than manual `@server.list_tools()` + `@server.call_tool()`
- Still allows returning `CallToolResult` directly for full control when needed
- Constitution Principle VI satisfied: `mcp` package is the official SDK

**Alternatives considered**:
- Low-level `mcp.server.lowlevel.Server`: More control over JSON Schema, but requires
  manually writing schemas and a dispatch function. Unnecessary for 5 simple tools.

### Decision 2: Transport — stdio

**Chosen**: stdio transport (`mcp.run(transport="stdio")`)

**Rationale**:
- The OpenAI Agents SDK connects to MCP servers via stdio (subprocess)
- No HTTP port conflicts with FastAPI (which runs on port 8000)
- Simplest deployment: agent spawns MCP server as a subprocess
- Spec assumption: "The MCP server communicates via stdio transport"

**Alternatives considered**:
- HTTP/SSE transport: Would require a separate port, more config, CORS setup.
  Unnecessary since the agent runs server-side and can use stdio directly.

### Decision 3: Sharing the Database Engine

**Chosen**: Direct import of `database.engine` and `Session` from `backend/database.py`

**Rationale**:
- The MCP server runs from the `backend/` directory (same Python path)
- `database.py` already builds the engine from `config.settings.database_url`
- `Session(engine)` provides synchronous sessions (MCP tools are sync-compatible)
- Zero code duplication; single source of truth for DB config
- FR-012: "MCP server MUST share the same database engine"

**Alternatives considered**:
- Separate engine in mcp_server.py: Violates FR-012, duplicates config
- Async sessions: MCP SDK's FastMCP supports async tools, but SQLModel sync
  sessions work fine within async handlers (the DB calls are fast and bounded)

### Decision 4: Tool Return Format — JSON String via TextContent

**Chosen**: Each tool returns a JSON string wrapped in `TextContent`

**Rationale**:
- MCP tools return `list[TextContent]` or plain values (FastMCP wraps automatically)
- The Phase III requirements specify exact JSON return formats (e.g., `{"task_id": 5, "status": "created", "title": "Buy groceries"}`)
- Returning `json.dumps(result_dict)` from each tool function lets FastMCP wrap it as TextContent
- The OpenAI agent receives the JSON string and can parse it

### Decision 5: Tool Descriptions — Rich, Agent-Oriented

**Chosen**: Tool descriptions include purpose, parameter details, and example usage
so the OpenAI agent can correctly route natural language to the right tool.

**Rationale**:
- Per the Agent Behavior Specification, the agent must map "add a task to buy groceries"
  to `add_task(title="Buy groceries")`
- Rich descriptions (including when to use each tool) help the agent make correct routing decisions
- Docstrings on `@mcp.tool()` decorated functions become the tool descriptions automatically

## Error Handling Strategy

All tools follow a consistent error pattern:

1. **Validate inputs** — check required fields, types, value constraints
2. **Query database** — scope by user_id always
3. **Check result** — if task not found or not owned, return error JSON
4. **Return success** — structured JSON per Phase III spec

Error responses use `json.dumps({"error": "message"})` returned as a string.
The MCP SDK will wrap this in TextContent. The `isError` field on `CallToolResult`
is not used (the agent parses the JSON to detect errors by the presence of an
`"error"` key vs `"status"` key).

## Testing Strategy

### Unit Tests (pytest + SQLite in-memory)

Each tool function is tested independently:
- **Setup**: Create an in-memory SQLite DB, seed with test tasks
- **Test each tool**: Call the function directly, assert DB state and return value
- **Test isolation**: Verify user_id scoping (Alice can't see Bob's tasks)
- **Test errors**: Missing task, invalid params, empty title, cross-user access

### Integration Tests (MCP client)

- Start the MCP server as a subprocess
- Connect via stdio using `mcp` client library
- Call `tools/list` to verify all 5 tools appear with correct schemas
- Call each tool and verify response format matches Phase III spec
- Test error cases end-to-end

### Manual Verification

- Run `python mcp_server.py` and connect with a simple MCP client script
- List tools, call each one, verify JSON output

## Complexity Tracking

> No Constitution violations. No complexity justifications needed.

## Phase 1 Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven | PASS | All decisions trace to FR-001–FR-014 |
| II. Multi-User Isolation | PASS | Every tool takes user_id, every query filters by it |
| IV. Stateless | PASS | No in-memory state; Session created and closed per tool call |
| V. MCP-Only | PASS | 5 tools registered, no raw DB calls from agent |
| VI. Official SDK | PASS | `mcp` package, `FastMCP` from `mcp.server.fastmcp` |
| VII. Reproducibility | PASS | `mcp` pinned in requirements.txt |
