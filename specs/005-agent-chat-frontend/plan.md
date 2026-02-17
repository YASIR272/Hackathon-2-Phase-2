# Implementation Plan: OpenAI Agent, Chat Endpoint, Conversation Management & ChatKit Frontend

**Branch**: `005-agent-chat-frontend` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-agent-chat-frontend/spec.md`

## Summary

Build the complete AI chatbot experience: a stateless FastAPI chat endpoint that
accepts natural language messages, runs them through an OpenAI Agents SDK agent
connected to the MCP server (5 task tools via stdio), persists all conversation
history in the shared Neon PostgreSQL database, and exposes the interface through
an OpenAI ChatKit frontend with custom theming and tool call visualization.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/React (frontend)
**Primary Dependencies**: `openai-agents` (>=0.9.0), `@openai/chatkit-react`, existing FastAPI/SQLModel stack
**Storage**: Shared SQLModel engine from `backend/database.py` (Neon PostgreSQL / SQLite)
**Testing**: pytest with SQLite in-memory for unit tests, manual verification for frontend
**Target Platform**: Linux server (backend) / Browser (frontend) / Windows dev
**Project Type**: Web application (backend + frontend)
**Performance Goals**: <15s per chat response under normal conditions
**Constraints**: Stateless endpoint; official SDKs only; MCP-only task operations; ChatKit frontend
**Scale/Scope**: 1 new endpoint, 1 agent config, 1 frontend page, conversation CRUD

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | Plan follows spec.md FR-001 through FR-020 |
| II. Multi-User Isolation | PASS | JWT auth → user_id in system prompt → MCP tools scope by user_id; conversation ownership validated |
| III. Polished Professional UI | PASS | ChatKit integration with custom theming (FR-013, FR-015, FR-016, FR-017) |
| IV. Stateless Architecture | PASS | All state in DB; history loaded per request (FR-012); no server-side session |
| V. MCP-Only Task Operations | PASS | Agent uses MCP tools exclusively via MCPServerStdio (FR-007, FR-008) |
| VI. Official SDKs Only | PASS | `openai-agents` (official), `@openai/chatkit-react` (official), `mcp` (official) |
| VII. Full Reproducibility | PASS | Dependencies pinned; env vars documented; setup in quickstart.md |

**Gate result: PASS** — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-agent-chat-frontend/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── chat-api.json    # Chat endpoint request/response schema
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── config.py            # [MODIFIED] Add OPENAI_API_KEY setting
├── database.py          # [EXISTING] Engine + get_session, shared
├── models.py            # [EXISTING] Task, Conversation, Message models
├── auth.py              # [EXISTING] JWT verification
├── main.py              # [MODIFIED] Register chat router
├── mcp_server.py        # [EXISTING] MCP server with 5 tools (Spec 2)
├── agent.py             # [NEW] OpenAI Agent config + MCP client setup
├── schemas.py           # [MODIFIED] Add ChatRequest, ChatResponse, ToolCallInfo
├── requirements.txt     # [MODIFIED] Add openai-agents dependency
├── routes/
│   ├── tasks.py         # [EXISTING] FastAPI task routes
│   └── chat.py          # [NEW] Chat endpoint router
└── tests/
    ├── __init__.py      # [EXISTING]
    ├── test_mcp_tools.py  # [EXISTING] MCP tool tests (Spec 2)
    └── test_chat.py     # [NEW] Chat endpoint tests

chatkit-frontend/
├── package.json         # [NEW] Dependencies (@openai/chatkit-react)
├── index.html           # [NEW] HTML with ChatKit CDN script
├── src/
│   ├── App.tsx          # [NEW] Main app with ChatKit component
│   ├── main.tsx         # [NEW] React entry point
│   └── config.ts        # [NEW] API URL and domain key config
├── tsconfig.json        # [NEW]
└── vite.config.ts       # [NEW] Vite dev server config
```

**Structure Decision**: Backend adds 2 new files (`agent.py`, `routes/chat.py`) and
modifies 3 existing files. Frontend is a new lightweight React + Vite app in `chatkit-frontend/`
(separate from the existing Phase I/II Next.js app in `frontend/`)
with ChatKit as the primary component. No new backend directories needed.

## Key Decisions

### Decision 1: OpenAI Agents SDK with MCPServerStdio

**Chosen**: `openai-agents` package with `MCPServerStdio` for MCP server connection

**Rationale**:
- Official OpenAI SDK for building agents (Constitution Principle VI)
- `MCPServerStdio` spawns MCP server as subprocess, manages stdio transport
- `Agent` accepts `mcp_servers=[server]` — automatic tool discovery
- `Runner.run(agent, messages)` handles the full agent loop
- `RunResult.new_items` provides `ToolCallItem` for tracking tool invocations
- Async-compatible with FastAPI

**Alternatives considered**:
- Direct OpenAI function calling API: More manual, no MCP integration
- LangChain: Not an official SDK, violates Constitution Principle VI

### Decision 2: ChatKit Custom API Mode

**Chosen**: `CustomApiConfig` with `url` + `domainKey`

**Rationale**:
- Our architecture requires a custom backend (FastAPI + Agent + MCP)
- ChatKit is used as a **UI shell with custom message handling** via `onSendMessage`
  callback — the frontend intercepts user messages, sends them to our
  `POST /api/{user_id}/chat` endpoint via fetch, and renders the response
  in ChatKit's thread UI
- This avoids implementing the ChatKit wire protocol (OpenAI Responses-compatible),
  which would add unnecessary complexity for our custom agent backend
- `domainKey: "local-dev"` for development, production key from OpenAI dashboard
- Gives us full control over conversation flow and MCP tool execution

**Alternatives considered**:
- Hosted mode (`getClientSecret`): Bypasses our backend entirely
- Custom React chat UI: Violates Constitution Principle III

### Decision 3: MCP Server Lifecycle — Per-Request vs Long-Running

**Chosen**: Long-running MCP server managed at application startup

**Rationale**:
- Spawning MCP server per request adds ~1-2s latency (Python subprocess startup)
- Instead, start `MCPServerStdio` once during FastAPI lifespan and reuse
- The MCP server is stateless — safe to share across requests
- Clean shutdown via FastAPI lifespan context manager

**Implementation**:
```python
# In agent.py — singleton pattern
_mcp_server = None
_agent = None

async def get_agent():
    global _mcp_server, _agent
    if _agent is None:
        _mcp_server = MCPServerStdio(...)
        await _mcp_server.__aenter__()
        _agent = Agent(name="Todo Assistant", ..., mcp_servers=[_mcp_server])
    return _agent
```

**Alternatives considered**:
- Per-request MCPServerStdio: Too slow (~2s overhead per chat message)
- HTTP/SSE MCP transport: Unnecessary complexity for co-located server

### Decision 4: System Prompt — Agent Behavior Specification Embedding

**Chosen**: Full Agent Behavior Specification embedded in agent instructions

**Rationale**:
- The agent's system prompt must include:
  1. Role and personality ("helpful todo task manager assistant")
  2. User ID injection (`user_id` from authenticated request)
  3. Tool routing rules (natural language → MCP tool mapping)
  4. Response formatting rules (friendly confirmations, no raw JSON)
  5. Error handling rules (graceful messages for tool errors)
- User ID is dynamically injected per request via `instructions` parameter
- All 8 natural language command examples from the spec are covered

### Decision 5: Conversation History Management

**Chosen**: Load from DB, truncate to last 50 messages, pass as agent input

**Rationale**:
- Stateless endpoint: must load ALL context from DB each request
- Agent context window is limited — 50 messages is a reasonable default
- Messages stored with role ("user"/"assistant") match OpenAI message format
- `result.to_input_list()` is NOT used for history — we build from DB instead
- This ensures true statelessness (no dependency on previous RunResult)

### Decision 6: Frontend Technology — Vite + React + ChatKit

**Chosen**: Lightweight Vite + React app with `@openai/chatkit-react`

**Rationale**:
- ChatKit provides `<ChatKit>` component and `useChatKit` hook
- Vite is fastest for development iteration
- Minimal setup: ~5 files total
- ChatKit CDN script must be included in HTML
- Custom API config points to FastAPI backend

## Error Handling Strategy

### Backend Errors

| Error Type | HTTP Status | Response |
|-----------|-------------|----------|
| Empty message | 400 | `{"detail": "Message cannot be empty"}` |
| Invalid conversation_id | 404 | `{"detail": "Conversation not found"}` |
| Conversation ownership violation | 404 | `{"detail": "Conversation not found"}` |
| Authentication failure | 401 | `{"detail": "Could not validate credentials"}` |
| MCP server unavailable | 503 | `{"detail": "Task service temporarily unavailable"}` |
| Agent timeout (>30s) | 504 | `{"detail": "Request timed out"}` |
| OpenAI API error | 502 | `{"detail": "AI service temporarily unavailable"}` |

### Frontend Errors

- Loading states: ChatKit shows built-in loading indicator
- Error display: ChatKit `onError` event handler shows user-friendly toast
- Network failure: Retry prompt displayed

## Testing Strategy

### Unit Tests (pytest + SQLite in-memory)

**`backend/tests/test_chat.py`**:
- Test conversation creation (no conversation_id → new record)
- Test conversation resumption (valid conversation_id → history loaded)
- Test conversation ownership validation (user A can't access user B's conversation)
- Test empty message rejection
- Test invalid conversation_id rejection
- Test response format matches contract (conversation_id, response, tool_calls)

### Integration Tests (with MCP server)

- Test end-to-end: send "Add a task to buy groceries" → verify add_task called
- Test all 8 natural language command examples from spec
- Test conversation persistence across multiple requests
- Test multi-user isolation end-to-end

### Manual Verification

- ChatKit loads in browser
- Messages sent, responses displayed
- Tool calls visible in response
- Conversation history persists
- Domain allowlist works in production

## Complexity Tracking

> No Constitution violations. No complexity justifications needed.

## Phase 1 Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven | PASS | All decisions trace to FR-001–FR-020 |
| II. Multi-User Isolation | PASS | JWT → user_id → system prompt → MCP tools; conversation ownership checked |
| IV. Stateless | PASS | All state in DB; agent created once, conversation loaded per request |
| V. MCP-Only | PASS | Agent uses MCPServerStdio; no direct DB calls for tasks |
| VI. Official SDK | PASS | `openai-agents`, `@openai/chatkit-react`, `mcp` — all official |
| VII. Reproducibility | PASS | Dependencies pinned; env vars in quickstart.md |
