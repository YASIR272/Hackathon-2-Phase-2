---
id: 2
title: Amend Constitution for Phase III
stage: constitution
date: 2026-02-14
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: main
user: default
command: /sp.constitution
labels: ["constitution", "phase-iii", "mcp", "ai-chatbot", "chatkit"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

/sp.constitution

Project: Full-Stack Todo Web Application with AI Chatbot (Phases I, II, III)

Core principles:
- Strict adherence to the exact requirements, architecture diagrams, and technology stack provided in each phase
- Agentic development only: every line of code must be generated via the Spec → Plan → Tasks → Claude Code workflow (no manual coding)
- Stateless, scalable, production-ready design (especially for Phase III)
- Security, input validation, and proper error handling at every layer
- Clean, readable, well-documented code with clear separation of concerns
- Full reproducibility: everything must be configurable via environment variables and documented in README

Key standards:
- Follow the exact database models, API contracts, MCP tool signatures, and agent behaviors specified in Phase III
- Use official SDKs only (Official MCP Python SDK, OpenAI Agents SDK, SQLModel, FastAPI, Better Auth, OpenAI ChatKit)
- All state (tasks, conversations, messages) persisted in Neon PostgreSQL
- MCP tools must be stateless and operate exclusively through the database
- Agent must follow the exact natural-language command mappings and always confirm actions
- Frontend must be a pure OpenAI ChatKit integration (no custom React components unless explicitly allowed)

Constraints:
- Phase III must be implemented as a complete, standalone AI chatbot layer (can optionally integrate with Phase I/II frontend if it exists, but ChatKit is the required UI)
- Server must remain completely stateless (conversation state lives only in DB)
- No hard-coded credentials, no manual DB calls outside MCP tools or ORM
- Domain allowlist configuration for ChatKit must be documented
- Word count / scope: deliver exactly the features listed, no extra polish unless it improves core functionality

Success criteria:
- Working MCP server exposing the five exact tools (add_task, list_tasks, complete_task, delete_task, update_task)
- OpenAI Agent correctly routes every example natural-language command to the right tool(s) and returns friendly confirmations
- Chat endpoint is stateless, persists full conversation history, and supports resuming conversations
- ChatKit frontend connects to the backend, respects the domain allowlist, and displays tool calls + responses
- All deliverables (folder structure, migrations, README) are present and the app runs after a fresh clone + env setup
- Zero manual coding was performed; everything was produced through the spec-kit workflow

Not allowed in any phase:
- Deviating from the listed technology stack
- Storing conversation state in memory
- Implementing tools outside the official MCP Python SDK
- Adding features not explicitly listed in the Phase III requirements

Phase-specific guidance (add to any existing constitution from Phases I–II):
- Phase III is built on top of the existing Todo backend/DB but uses a dedicated MCP layer for all task operations.
- The agent must never call raw DB functions — only the five MCP tools.
- All prompts to the agent (in the plan and implementation steps) must incl

## Response snapshot

Updated constitution from v1.0.0 to v2.0.0 (MAJOR bump). Added four new principles (IV. Stateless Scalable Architecture, V. MCP-Only Task Operations, VI. Official SDKs Only, VII. Full Reproducibility) and two new sections (Technology Stack Constraints, Development Workflow). Expanded existing principles II and III for Phase III scope. Governance section retained with semantic versioning policy.

## Outcome

- ✅ Impact: Constitution now covers all three phases with 7 principles, technology stack matrix, and development workflow
- 🧪 Tests: N/A (governance document)
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: /sp.specify for Phase III feature specification
- 🧠 Reflection: Major version bump warranted due to fundamental shift in how task operations work (MCP-only) and new system boundaries (Agent, ChatKit)

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS — no unresolved placeholders, all principles declarative and testable
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.specify to create Phase III feature spec
