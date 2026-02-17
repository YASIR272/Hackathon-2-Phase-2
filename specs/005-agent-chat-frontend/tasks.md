# Tasks: OpenAI Agent, Chat Endpoint, Conversation Management & ChatKit Frontend

**Input**: Design documents from `/specs/005-agent-chat-frontend/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/chat-api.json, quickstart.md
**Branch**: `005-agent-chat-frontend`
**Generated**: 2026-02-15

**Tests**: Test tasks included in Phase 9 (Polish) — not TDD-first, as spec does not request TDD approach.

**Organization**: Tasks grouped by user story. US1–US3 and US6 (all P1) share `backend/routes/chat.py` and `backend/agent.py` — they are layered incrementally on the same files but each phase adds a distinct, independently testable capability.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and configure environment variables

- [x] T001 Add `openai-agents` dependency to backend/requirements.txt
- [x] T002 [P] Add `openai_api_key` setting to Settings class in backend/config.py
- [x] T003 [P] Add `OPENAI_API_KEY` variable with documentation to backend/.env.example

**Checkpoint**: Dependencies installed, environment configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create core schemas, agent module skeleton, router skeleton, and wire them into the app

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add ChatRequest, ChatResponse, and ToolCallInfo Pydantic models to backend/schemas.py per contracts/chat-api.json
- [x] T005 [P] Create backend/agent.py with MCPServerStdio singleton lifecycle (startup/shutdown), basic Agent instantiation, and system prompt template placeholder
- [x] T006 [P] Create backend/routes/chat.py with APIRouter and POST /api/{user_id}/chat endpoint skeleton returning placeholder response
- [x] T007 Register chat router in backend/main.py and add agent startup/shutdown to lifespan handler

**Checkpoint**: Foundation ready — `POST /api/{user_id}/chat` returns a placeholder response, agent module initializes on startup

---

## Phase 3: User Story 1 — Chat Endpoint Processes Messages and Returns AI Responses (Priority: P1) MVP

**Goal**: A user can POST a message to the chat endpoint and receive an AI-generated response from the OpenAI agent with MCP tool access

**Independent Test**: `curl -X POST /api/{user_id}/chat -d '{"message":"Add a task to buy groceries"}'` returns `{conversation_id, response, tool_calls}` with the agent's confirmation text

### Implementation for User Story 1

- [x] T008 [US1] Implement core chat handler — accept ChatRequest body, extract user_id from path, call agent runner, and return ChatResponse in backend/routes/chat.py
- [x] T009 [US1] Implement agent invocation — call `Runner.run(agent, input_messages)` with user message and extract `final_output` as response text in backend/routes/chat.py
- [x] T010 [US1] Add input validation — reject empty/whitespace-only message with HTTP 400 and `{"detail": "Message cannot be empty"}` in backend/routes/chat.py
- [x] T011 [US1] Add error handling — catch agent timeout (504), MCP server unavailable (503), and OpenAI API errors (502) with structured error responses in backend/routes/chat.py

**Checkpoint**: Chat endpoint accepts a message, runs the agent with MCP tools, and returns the AI response. Single-turn only (no conversation persistence yet).

---

## Phase 4: User Story 2 — Conversation History Persistence and Resumption (Priority: P1)

**Goal**: Conversations are created, messages are persisted to the database, and history is loaded on subsequent requests so users can resume conversations

**Independent Test**: Send 3 messages with same conversation_id, then send a follow-up — the agent's response demonstrates awareness of prior messages

### Implementation for User Story 2

- [x] T012 [US2] Implement new conversation creation — when no conversation_id is provided, create a Conversation record in DB and return the new ID in backend/routes/chat.py
- [x] T013 [US2] Implement conversation history loading — fetch last 50 messages ordered by created_at for a given conversation_id from DB in backend/routes/chat.py
- [x] T014 [US2] Implement message persistence — store user message (role="user") before agent run, store assistant response (role="assistant") after agent run in backend/routes/chat.py
- [x] T015 [US2] Add conversation_id validation — return HTTP 404 `{"detail": "Conversation not found"}` for non-existent conversation_id in backend/routes/chat.py

**Checkpoint**: Conversations are created/resumed, all messages are persisted in DB, history is loaded into agent context on each request. Stateless — survives server restart.

---

## Phase 5: User Story 3 — Agent Routes Natural Language to MCP Tools (Priority: P1)

**Goal**: The AI agent correctly interprets natural language commands and invokes the appropriate MCP tool(s) with correct parameters, returning friendly confirmations

**Independent Test**: Send all 8 NL command examples from spec (add, list pending, complete, delete, update, implicit add, list completed, general query) — each routes to the correct MCP tool

### Implementation for User Story 3

- [x] T016 [US3] Engineer complete agent system prompt with tool routing rules for all 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) in backend/agent.py
- [x] T017 [US3] Implement dynamic user_id injection — create a function that formats the system prompt template with the authenticated user_id per request in backend/agent.py
- [x] T018 [US3] Extract tool call data from RunResult.new_items — map ToolCallItem and ToolCallOutputItem to ToolCallInfo schema objects in backend/routes/chat.py
- [x] T019 [P] [US3] Add friendly response formatting and error handling rules to the agent system prompt (no raw JSON, conversational confirmations, graceful tool error messages) in backend/agent.py

**Checkpoint**: All 8 natural language command examples from the spec are correctly routed. Tool calls are extracted and returned in the response. Agent responses are friendly and conversational.

---

## Phase 6: User Story 6 — Multi-User Isolation in Chat (Priority: P1)

**Goal**: Each user's conversations, messages, and task operations are completely isolated — no cross-user data leakage

**Independent Test**: Create conversations for user Alice and user Bob, verify neither can access the other's conversation by ID, and verify task operations scope to the correct user

### Implementation for User Story 6

- [x] T020 [US6] Implement conversation ownership validation — verify conversation.user_id matches the authenticated user before loading history, return 404 if mismatch in backend/routes/chat.py
- [x] T021 [US6] Ensure user_id from JWT auth is passed into agent system prompt and propagated to every MCP tool call for user-level task isolation in backend/routes/chat.py
- [x] T022 [US6] Validate path parameter {user_id} matches JWT-derived user_id using existing auth pattern from backend/routes/tasks.py in backend/routes/chat.py

**Checkpoint**: User A cannot see User B's conversations or tasks. Ownership checks enforce isolation at conversation, message, and MCP tool levels.

---

## Phase 7: User Story 4 — ChatKit Frontend Displays Chat Interface (Priority: P2)

**Goal**: A polished ChatKit-powered chat interface where users can type messages, see AI responses, and view tool call activity

**Independent Test**: Open the frontend URL, type "Add a task to test ChatKit", submit — the response appears in the chat thread with tool call indication

**Note**: The existing `frontend/` directory contains a Phase I/II Next.js app. Per plan.md Decision 6, the ChatKit frontend is a new lightweight Vite + React app. The implementation should create a `chatkit-frontend/` directory to avoid conflicts with the existing Next.js frontend, or integrate ChatKit into the existing app — clarify with the architect before starting this phase.

### Implementation for User Story 4

- [x] T023 [P] [US4] Initialize Vite + React + TypeScript project with `@openai/chatkit-react` dependency — create package.json, tsconfig.json, vite.config.ts in chatkit-frontend/
- [x] T024 [P] [US4] Create chatkit-frontend/src/config.ts with API base URL, auth token retrieval, and ChatKit domain key configuration
- [x] T025 [US4] Create chatkit-frontend/index.html with ChatKit CDN script tag and React root mount point
- [x] T026 [US4] Implement chatkit-frontend/src/App.tsx with ChatKit component connected to POST /api/{user_id}/chat via custom fetch handler
- [x] T027 [US4] Create chatkit-frontend/src/main.tsx as React entry point rendering App component
- [x] T028 [US4] Configure chatkit-frontend/vite.config.ts with dev server proxy to backend (localhost:8000)
- [x] T029 [US4] Add loading indicator during backend processing and user-friendly error display on backend errors in chatkit-frontend/src/App.tsx
- [x] T030 [US4] Ensure responsive layout adapts to mobile screen sizes in chatkit-frontend/src/App.tsx

**Checkpoint**: ChatKit frontend loads in browser, user can type and send messages, AI responses display in the chat thread, tool calls are visually indicated, errors show friendly messages.

---

## Phase 8: User Story 5 — ChatKit UI Customization and Theming (Priority: P3)

**Goal**: The ChatKit interface matches the application's visual identity with custom theming, dark/light mode, and polished micro-interactions

**Independent Test**: Compare ChatKit appearance against theme configuration — verify colors, typography, spacing, and dark/light toggle all match the specified values

### Implementation for User Story 5

- [x] T031 [US5] Apply custom theme configuration (colorScheme, radius, density, typography, accent/surface/grayscale colors) to ChatKit component in chatkit-frontend/src/App.tsx
- [x] T032 [US5] Implement dark/light mode toggle that updates ChatKit colorScheme dynamically in chatkit-frontend/src/App.tsx
- [x] T033 [US5] Configure ChatKit start screen with greeting text, welcome message, and suggested prompt buttons in chatkit-frontend/src/App.tsx
- [x] T034 [US5] Document ChatKit domain allowlist configuration for production deployment with step-by-step instructions in specs/005-agent-chat-frontend/quickstart.md

**Checkpoint**: ChatKit matches application visual identity, dark/light mode works, start screen displays greeting and suggested prompts, production domain setup is documented.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Tests, documentation, and end-to-end validation across all user stories

- [x] T035 [P] Write unit tests for chat endpoint — conversation CRUD, message persistence, validation errors, ownership checks — in backend/tests/test_chat.py
- [x] T036 [P] Update backend/.env.example with all new environment variables and inline documentation
- [ ] T037 Run quickstart.md manual verification checklist end-to-end — all 12 items must pass
- [ ] T038 Verify all 8 natural language command examples from spec route correctly to MCP tools (SC-003 validation)

**Checkpoint**: All tests pass, quickstart verification complete, all success criteria (SC-001 through SC-008) validated.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — core endpoint, MVP target
- **US2 (Phase 4)**: Depends on Phase 3 — layers persistence onto the working endpoint
- **US3 (Phase 5)**: Depends on Phase 3 — layers NL routing onto the working endpoint; can run in parallel with US2
- **US6 (Phase 6)**: Depends on Phase 4 — adds ownership checks to conversation management
- **US4 (Phase 7)**: Depends on Phase 3 — frontend needs a working backend; can run in parallel with US2/US3/US6
- **US5 (Phase 8)**: Depends on Phase 7 — theming builds on the working ChatKit frontend
- **Polish (Phase 9)**: Depends on all prior phases — end-to-end validation

### User Story Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational)
        ├── Phase 3: US1 (Chat Endpoint) ← MVP
        │     ├── Phase 4: US2 (Conversation Persistence)
        │     │     └── Phase 6: US6 (Multi-User Isolation)
        │     ├── Phase 5: US3 (Agent NL Routing) [parallel with US2]
        │     └── Phase 7: US4 (ChatKit Frontend) [parallel with US2/US3/US6]
        │           └── Phase 8: US5 (UI Customization)
        └── Phase 9 (Polish) [after all stories]
```

### Within Each User Story

- Schemas/models before services/handlers
- Core logic before validation/error handling
- Backend before frontend (for the same capability)
- Implementation before polish/theming

### Parallel Opportunities

**Within Phase 1**: T002 and T003 can run in parallel (different files)
**Within Phase 2**: T004, T005, T006 can run in parallel (different files); T007 depends on T005+T006
**Across Phases**: After Phase 3 completes:
  - US2 (Phase 4) and US3 (Phase 5) can run in parallel
  - US4 (Phase 7) can start as soon as Phase 3 is done (frontend is independent of backend phases 4-6)
**Within Phase 7**: T023 and T024 can run in parallel (different files)
**Within Phase 9**: T035 and T036 can run in parallel

---

## Parallel Example: After Phase 3 (MVP)

```
# Stream A (Backend refinement):
Phase 4: US2 (Conversation Persistence) → Phase 6: US6 (Isolation)
Phase 5: US3 (Agent NL Routing) [parallel with Phase 4]

# Stream B (Frontend):
Phase 7: US4 (ChatKit Frontend) → Phase 8: US5 (Theming)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T007)
3. Complete Phase 3: US1 — Chat Endpoint (T008–T011)
4. **STOP and VALIDATE**: Send a message via curl, verify AI response with tool calls
5. Deploy/demo if ready — single-turn chat works

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Test independently → **MVP! Single-turn chat works**
3. US2 → Test independently → Multi-turn conversations persist
4. US3 → Test independently → All NL commands route correctly
5. US6 → Test independently → Multi-user isolation complete
6. US4 → Test independently → ChatKit frontend works
7. US5 → Test independently → UI polished and themed
8. Polish → Full validation → Production-ready

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (T001–T011)**

This delivers a working chat endpoint that accepts natural language messages, runs them through the OpenAI agent with MCP tools, and returns AI responses with tool call data. Testable via curl without any frontend.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- US1–US3 and US6 all modify `backend/routes/chat.py` and `backend/agent.py` — implement sequentially
- US4 (frontend) is fully independent of US2/US3/US6 — can start as soon as US1 is done
- The existing `frontend/` contains a Next.js app from Phase I/II — ChatKit frontend should be in `chatkit-frontend/` or integrated via discussion with architect
- Total tasks: 38 (3 setup + 4 foundational + 4 US1 + 4 US2 + 4 US3 + 3 US6 + 8 US4 + 4 US5 + 4 polish)
