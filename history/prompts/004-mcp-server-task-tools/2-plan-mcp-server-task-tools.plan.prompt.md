---
id: 2
title: Plan MCP Server Task Tools
stage: plan
date: 2026-02-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: 004-mcp-server-task-tools
branch: 004-mcp-server-task-tools
user: user
command: /sp.plan
labels: ["mcp", "task-tools", "architecture", "planning"]
links:
  spec: specs/004-mcp-server-task-tools/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-mcp-server-task-tools/plan.md
  - specs/004-mcp-server-task-tools/research.md
  - specs/004-mcp-server-task-tools/data-model.md
  - specs/004-mcp-server-task-tools/quickstart.md
  - specs/004-mcp-server-task-tools/contracts/mcp-tools.json
tests:
  - none (plan phase)
---

## Prompt

/sp.plan-2

Create: MCP server skeleton using official SDK, tool function decorators/registrations, shared DB session factory, error handling middleware.

Decisions needing documentation:
- Transport (stdio vs HTTP/SSE) — recommendation for this project
- How to share the SQLModel engine between FastAPI and MCP server
- Tool descriptions and parameter schemas (must be rich enough for the OpenAI agent)

Testing strategy:
- Unit tests for each tool (mock DB)
- Integration tests that call the MCP server directly and verify tool outputs
- Manual test with a simple MCP client to list tools and call each one

Technical details:
- Reference the exact tool examples from the requirements (input/output JSON)
- Use the Agent Behavior Specification to write helpful tool descriptions
- Follow the updated sp.constitution (stateless, security, official SDK only)
- Break into tasks: 1) server boilerplate, 2) each tool, 3) testing

## Response snapshot

Generated complete implementation plan for MCP server with 5 task tools. Key decisions:
1. **FastMCP** (high-level API from official `mcp` package) — auto-generates JSON Schema from type hints
2. **stdio transport** — matches OpenAI Agents SDK integration pattern, no port conflicts
3. **Direct import of database.engine** — shared DB, zero duplication, FR-012 compliant
4. **JSON string returns** — match Phase III requirement examples exactly
5. **Rich docstring descriptions** — optimized for agent routing accuracy

Artifacts produced: plan.md, research.md (6 topics), data-model.md, contracts/mcp-tools.json (full JSON Schema for all 5 tools), quickstart.md. Constitution check: PASS on all 7 principles (pre and post design).

Source structure: 1 new file (mcp_server.py), 1 modified (requirements.txt), 1 new test file (tests/test_mcp_tools.py).

## Outcome

- ✅ Impact: Complete architectural plan ready for task generation
- 🧪 Tests: Testing strategy defined (unit + integration + manual)
- 📁 Files: 5 plan artifacts created (plan.md, research.md, data-model.md, quickstart.md, mcp-tools.json)
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: FastMCP being part of official mcp package is key clarification — constitution Principle VI is satisfied

## Evaluation notes (flywheel)

- Failure modes observed: None — clear requirements, SDK research resolved all unknowns
- Graders run and results (PASS/FAIL): Constitution check PASS (7/7 principles, pre + post)
- Prompt variant (if applicable): sp.plan standard flow
- Next experiment (smallest change to try): Proceed to /sp.tasks
