---
id: 2
title: Create Core Backend Implementation Plan
stage: plan
date: 2026-02-14
surface: agent
model: Claude Sonnet 4.5
feature: 003-core-backend-auth
branch: 003-core-backend-auth
user: default
command: /sp.plan
labels: ["plan", "phase-iii", "fastapi", "sqlmodel", "architecture", "neon-postgresql"]
links:
  spec: specs/003-core-backend-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-core-backend-auth/plan.md
  - specs/003-core-backend-auth/research.md
  - specs/003-core-backend-auth/data-model.md
  - specs/003-core-backend-auth/quickstart.md
  - specs/003-core-backend-auth/contracts/health-api.md
  - specs/003-core-backend-auth/contracts/auth-dependency.md
tests:
  - null
---

## Prompt

/sp.plan-1

Create: full project/folder structure for the backend, SQLModel model definitions (with diagram), FastAPI app skeleton, database session management, Better Auth setup, migration strategy.

Decisions needing documentation:
- Sync vs async engine (tradeoffs for Neon serverless)
- How user_id will be extracted for MCP tools (Better Auth session vs header)
- Migration tool (Alembic vs SQLModel metadata.create_all)

Testing strategy:
- Pytest + pytest-asyncio for model creation, CRUD helpers, auth flows
- Integration tests against a test Neon/Testcontainers database
- Validate all model fields and relationships

Technical details:
- Follow the exact field lists from the Phase III requirements
- Use the updated sp.constitution (especially stateless design and security)
- Break the implementation into small, reviewable tasks for Claude Code
- After implementation, run full test suite and document any decisions

## Response snapshot

Generated complete implementation plan with 6 artifacts:
1. **plan.md** — Main plan with technical context, constitution check (all PASS), project structure (extend existing backend/ in-place), 3 architectural decisions (D1: sync engine with psycopg2-binary, D2: create_all not Alembic, D3: keep existing PyJWT auth), 6 file changes, testing strategy, and risk assessment.
2. **research.md** — 3 decisions with rationale: sync engine (SQLModel 0.0.16 lacks async), create_all (idempotent, adequate for MVP), PyJWT (already working in Phase II).
3. **data-model.md** — ER diagram, 3 entities (Task, Conversation, Message) with full field specs, indexes, relationships, validation rules.
4. **contracts/health-api.md** — GET /health contract with DB connectivity check.
5. **contracts/auth-dependency.md** — Auth dependency contract with token verification flow.
6. **quickstart.md** — Setup guide with env variable table.

Key decisions: extend existing backend in-place (no package restructuring), preserve Phase II backward compatibility, additive-only changes.

## Outcome

- ✅ Impact: Complete implementation plan covering all 14 functional requirements with 6 artifacts
- 🧪 Tests: Testing strategy defined (pytest + httpx TestClient)
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/health-api.md, contracts/auth-dependency.md
- 🔁 Next prompts: /sp.tasks to generate implementation task list
- 🧠 Reflection: Decision to keep sync engine is pragmatic for SQLModel 0.0.16 compatibility. Extending existing backend in-place avoids breaking deployed Hugging Face Spaces instance.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS (all 7 principles), all NEEDS CLARIFICATION resolved in research
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.tasks to generate task breakdown
