---
id: 2
title: Plan Agent Chat Frontend
stage: plan
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-agent-chat-frontend
branch: 005-agent-chat-frontend
user: default
command: /sp.plan
labels: ["plan", "agent", "chat", "chatkit", "mcp", "architecture"]
links:
  spec: specs/005-agent-chat-frontend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-agent-chat-frontend/plan.md
  - specs/005-agent-chat-frontend/research.md
  - specs/005-agent-chat-frontend/data-model.md
  - specs/005-agent-chat-frontend/quickstart.md
  - specs/005-agent-chat-frontend/contracts/chat-api.json
tests:
  - N/A (planning phase)
---

## Prompt

/sp.plan-3 Create: FastAPI chat router, OpenAI Agent + Runner configuration connected to MCP server/tools, Conversation/message persistence logic, OpenAI ChatKit frontend integration, UI customization & updates, Domain allowlist setup instructions. Decisions needing documentation: MCP server discovery/connection strategy, System prompt engineering, ChatKit integration mode, Auth flow, UI customization scope, Error handling. Testing strategy: unit/integration tests for chat endpoint, e2e tests for NL commands, conversation resume test, frontend tests.

## Response snapshot

Created comprehensive implementation plan with 7 research topics, 6 key architecture decisions, and full project structure:

**Research (Phase 0)**:
1. OpenAI Agents SDK — Agent + Runner + MCP integration via MCPServerStdio
2. ChatKit Custom API mode (url + domainKey) vs Hosted mode
3. ChatKit backend protocol requirements
4. Stateless conversation flow cycle
5. System prompt engineering with Agent Behavior Spec
6. Auth flow: JWT → user_id → system prompt → MCP tools
7. ChatKit theming & UI customization

**Key Decisions**:
1. OpenAI Agents SDK with MCPServerStdio for MCP connection
2. ChatKit Custom API mode (not hosted)
3. Long-running MCP server (singleton, not per-request)
4. Full Agent Behavior Spec embedded in system prompt
5. DB-loaded conversation history (last 50 messages)
6. Vite + React + ChatKit frontend

**Artifacts**: plan.md, research.md, data-model.md, quickstart.md, contracts/chat-api.json

## Outcome

- ✅ Impact: Complete architecture plan ready for /sp.tasks
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 5 created (plan.md, research.md, data-model.md, quickstart.md, chat-api.json)
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Web search was unavailable; WebFetch to GitHub raw content and OpenAI docs worked well for research

## Evaluation notes (flywheel)

- Failure modes observed: Web search tool returned errors; ChatKit docs partially inaccessible (403). Mitigated by fetching raw GitHub content and TypeScript type definitions directly.
- Graders run and results (PASS/FAIL): Constitution Check PASS (all 7 principles), Post-Design Re-Check PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A — proceed to task generation
