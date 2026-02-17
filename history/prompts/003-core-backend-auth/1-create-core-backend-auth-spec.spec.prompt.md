---
id: 1
title: Create Core Backend Auth Spec
stage: spec
date: 2026-02-14
surface: agent
model: Claude Sonnet 4.5
feature: 003-core-backend-auth
branch: 003-core-backend-auth
user: default
command: /sp.specify
labels: ["spec", "phase-iii", "fastapi", "sqlmodel", "better-auth", "neon-postgresql"]
links:
  spec: specs/003-core-backend-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-core-backend-auth/spec.md
  - specs/003-core-backend-auth/checklists/requirements.md
tests:
  - null
---

## Prompt

/sp.specify-1 Phase III – Spec 1: Core Backend, Database Models & Authentication

Target: Build the foundational FastAPI backend, Neon PostgreSQL connection, SQLModel ORM models, and Better Auth integration.

Success criteria:
- FastAPI server starts and serves a /health endpoint
- SQLModel models (Task, Conversation, Message) are defined exactly as specified, with proper relationships and indexes
- Database migrations (or create_all) work on Neon Serverless PostgreSQL
- Better Auth is integrated and user_id is available in request context (tools will receive user_id as string)
- Environment variables are properly loaded (DATABASE_URL, etc.)
- Folder structure: /backend with clear subfolders (models, database, auth, etc.)

Constraints:
- Python + FastAPI + SQLModel + Better Auth + Neon (PostgreSQL)
- Async where possible
- Use official connection pooling / engine configuration

Not building:
- Any MCP server code
- Any OpenAI Agents SDK code
- Any frontend / ChatKit code
- The /api/{user_id}/chat endpoint

## Response snapshot

Created feature branch `003-core-backend-auth` and wrote the specification at `specs/003-core-backend-auth/spec.md`. The spec defines 4 user stories (3x P1, 1x P2): Server Health Check, Database Models & Schema Creation, Authentication & User Context, and Environment Configuration. 14 functional requirements cover all aspects: FastAPI entry point, health endpoint, three SQLModel models (Task, Conversation, Message) with exact field definitions, indexes, foreign keys, async Neon PostgreSQL connection, Better Auth JWT integration, environment configuration, CORS, and folder structure. 6 measurable success criteria defined. All quality checklist items pass — no NEEDS CLARIFICATION markers remain.

## Outcome

- ✅ Impact: Foundational spec for Phase III backend covering models, auth, and server setup
- 🧪 Tests: N/A (specification document)
- 📁 Files: specs/003-core-backend-auth/spec.md, specs/003-core-backend-auth/checklists/requirements.md
- 🔁 Next prompts: /sp.plan to create the implementation plan, or /sp.clarify if refinement needed
- 🧠 Reflection: Spec leveraged existing Phase II backend analysis to make informed assumptions rather than using NEEDS CLARIFICATION markers, resulting in a clean spec with zero open questions

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell create-new-feature script fails with special characters in description; branch creation succeeds but JSON output not generated
- Graders run and results (PASS/FAIL): Quality checklist PASS (all 16 items)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.plan to produce architecture and data model
