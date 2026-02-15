---
id: 1
title: Specify MCP Server Task Tools
stage: spec
date: 2026-02-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: 004-mcp-server-task-tools
branch: 004-mcp-server-task-tools
user: user
command: /sp.specify
labels: ["mcp", "task-tools", "specification"]
links:
  spec: specs/004-mcp-server-task-tools/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-mcp-server-task-tools/spec.md
  - specs/004-mcp-server-task-tools/checklists/requirements.md
tests:
  - none (spec phase)
---

## Prompt

I am giving you the sp.specify command again: /sp.specify-2 Phase III – Spec 2: MCP Server and All Task Tools

Target: Build a standalone MCP server using the Official MCP Python SDK that exposes the five required tools, all backed by the database from Spec 1.

Success criteria:
- MCP server starts and is discoverable (tools list is retrievable)
- All five tools (add_task, list_tasks, complete_task, delete_task, update_task) are implemented exactly with the parameter signatures and return formats shown in the requirements
- Tools are 100% stateless and use only the SQLModel session from the shared database
- user_id is handled correctly for multi-user isolation
- Error handling for "task not found", invalid IDs, etc.

Constraints:
- Must use the official MCP Python SDK (not FastMCP or custom implementations unless it wraps the official SDK)
- Tools must be registered exactly as MCP tools (JSON schema, descriptions, etc.)
- Share the same database connection/engine as the main backend

Not building:
- The FastAPI chat endpoint
- The OpenAI Agent /

## Response snapshot

Created feature branch `004-mcp-server-task-tools` and wrote the full specification at `specs/004-mcp-server-task-tools/spec.md`. The spec covers:
- 6 user stories (P1: server discovery, add_task, list_tasks; P2: complete_task, delete_task, update_task)
- 14 functional requirements with exact parameter signatures and return formats per the Phase III requirements
- 6 edge cases covering invalid IDs, long titles, concurrency, db loss, invalid status, no-op updates
- 6 measurable success criteria (tool discovery, creation reliability, listing accuracy, multi-user isolation, error handling, performance)
- Key entity definition, assumptions, and dependency on Spec 1

Quality checklist at `specs/004-mcp-server-task-tools/checklists/requirements.md` — all items pass. No [NEEDS CLARIFICATION] markers needed.

## Outcome

- ✅ Impact: Feature specification complete, ready for planning phase
- 🧪 Tests: No tests (spec phase — tests defined in acceptance scenarios)
- 📁 Files: spec.md, checklists/requirements.md created
- 🔁 Next prompts: /sp.clarify or /sp.plan for 004-mcp-server-task-tools
- 🧠 Reflection: User input was detailed enough to avoid all clarification markers; tool signatures from Phase III requirements doc matched cleanly

## Evaluation notes (flywheel)

- Failure modes observed: None — clear requirements
- Graders run and results (PASS/FAIL): Quality checklist PASS (16/16 items)
- Prompt variant (if applicable): sp.specify standard flow
- Next experiment (smallest change to try): Proceed to /sp.plan
