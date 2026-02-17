<!--
=== Sync Impact Report ===
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR — backward-incompatible addition of Phase III
  principles (MCP layer, OpenAI Agent, ChatKit frontend) that
  redefine how task operations are performed and add entirely new
  system boundaries.

Modified principles:
  - "I. Spec-Driven Development" (unchanged, carried forward)
  - "II. Multi-User Isolation & Security" (expanded for Phase III
     stateless chat + conversation persistence)
  - "III. Polished Professional UI" (expanded to include ChatKit
     as the required Phase III frontend)

Added principles:
  - "IV. Stateless Scalable Architecture"
  - "V. MCP-Only Task Operations"
  - "VI. Official SDKs Only"
  - "VII. Full Reproducibility"

Added sections:
  - "Technology Stack Constraints"
  - "Development Workflow"

Removed sections: none (Governance retained and updated)

Templates requiring updates:
  - .specify/templates/plan-template.md — Constitution Check
    references generic gates; ⚠ pending (update gates after
    first /sp.plan run for Phase III feature)
  - .specify/templates/spec-template.md — ✅ no changes needed
    (template is feature-agnostic)
  - .specify/templates/tasks-template.md — ✅ no changes needed
    (template is feature-agnostic)

Follow-up TODOs: none
=== End Sync Impact Report ===
-->

# Full-Stack Todo Web Application with AI Chatbot Constitution

## Core Principles

### I. Spec-Driven Development

Every line of code MUST be generated via the Spec -> Plan -> Tasks ->
Claude Code workflow. No manual coding outside the agent workflow is
permitted. All changes MUST reference relevant specs and follow the
SDD lifecycle. Code reviews and PRs MUST verify that each change
traces back to a spec or task.

### II. Multi-User Isolation & Security

The system MUST enforce strict multi-user isolation at every layer.
All API endpoints MUST validate user ownership before returning or
mutating data. Authentication MUST use Better Auth with JWT;
credentials and secrets MUST never be hard-coded. Input validation
and proper error handling are required at every system boundary.
Conversation and message data in Phase III MUST be scoped to the
authenticated user. WCAG 2.1 AA accessibility compliance is
required for all UI surfaces.

### III. Polished Professional UI

All user-facing interfaces MUST deliver a clean, minimal, premium
experience inspired by modern apps (Notion, Linear, Todoist).
Phase I/II frontend MUST use Shadcn/ui or Radix + Tailwind with
full dark/light theme support via next-themes. Phase III chatbot
frontend MUST be a pure OpenAI ChatKit integration — no custom
React components unless explicitly allowed. Subtle micro-interactions
(framer-motion or Tailwind animate) are required. Typography MUST
use a modern sans-serif system font stack with generous spacing
and clear hierarchy.

### IV. Stateless Scalable Architecture

The server MUST remain completely stateless. All state — tasks,
conversations, messages — MUST be persisted in Neon PostgreSQL.
Conversation state MUST never be stored in memory. The chat endpoint
MUST support resuming conversations by loading history from the
database. The system MUST be production-ready and horizontally
scalable with no server-side session affinity.

### V. MCP-Only Task Operations

In Phase III, all task operations MUST flow through the MCP
(Model Context Protocol) server. The agent MUST never call raw
database functions — only the five MCP tools: `add_task`,
`list_tasks`, `complete_task`, `delete_task`, `update_task`.
MCP tools MUST be stateless and operate exclusively through the
database. Tools MUST be implemented using the official MCP Python
SDK. The OpenAI Agent MUST correctly route every natural-language
command to the appropriate MCP tool(s) and return friendly
confirmations.

### VI. Official SDKs Only

All integrations MUST use official SDKs exclusively:
- **MCP**: Official MCP Python SDK
- **Agent**: OpenAI Agents SDK
- **ORM**: SQLModel
- **API**: FastAPI
- **Auth**: Better Auth
- **Chat UI**: OpenAI ChatKit

No third-party wrappers, unofficial forks, or custom protocol
implementations are permitted. Version pinning in requirements
files is required.

### VII. Full Reproducibility

The application MUST be fully reproducible from a fresh clone.
All configuration MUST be driven by environment variables
documented in a README. Database migrations MUST be automated.
The required folder structure, migration scripts, and setup
instructions MUST be present and complete so the app runs after
`git clone` + env setup with zero manual intervention.

## Technology Stack Constraints

The following technology choices are non-negotiable across all
phases:

| Layer | Phase I/II | Phase III |
|-------|-----------|-----------|
| Frontend | Next.js + Tailwind + Shadcn/ui | OpenAI ChatKit |
| Auth | Better Auth + JWT | Same (shared) |
| Backend API | Node.js/Express | FastAPI (Python) |
| ORM/Models | Drizzle | SQLModel |
| Database | Neon PostgreSQL | Same (shared) |
| MCP | N/A | Official MCP Python SDK |
| Agent | N/A | OpenAI Agents SDK |

Deviating from this stack in any phase is NOT allowed. Adding
features not explicitly listed in the phase requirements is NOT
allowed unless it directly improves core functionality.

## Development Workflow

All development MUST follow this sequence:

1. **Constitution** (`/sp.constitution`) — establish or amend
   project principles (this document).
2. **Specification** (`/sp.specify`) — capture feature requirements
   with testable acceptance criteria.
3. **Planning** (`/sp.plan`) — produce architecture decisions,
   data models, API contracts.
4. **Tasks** (`/sp.tasks`) — generate dependency-ordered,
   independently testable implementation tasks.
5. **Implementation** (`/sp.implement`) — execute tasks via
   Claude Code agent.

Every prompt interaction MUST be recorded as a PHR (Prompt History
Record). Architecturally significant decisions MUST be surfaced for
ADR documentation (never auto-created).

Code changes MUST be the smallest viable diff. Unrelated
refactoring is not permitted. Domain allowlist configuration for
ChatKit MUST be documented. All prompts to the agent in plan and
implementation steps MUST include the exact tool signatures and
expected behaviors from the Phase III specification.

## Governance

This constitution is the authoritative source of project principles.
It supersedes all other practices and conventions. Amendments
require:

1. A documented rationale for the change.
2. Explicit user approval before adoption.
3. A migration plan for any affected artifacts.
4. Version increment following semantic versioning:
   - **MAJOR**: Principle removals, redefinitions, or
     backward-incompatible governance changes.
   - **MINOR**: New principles added or materially expanded
     guidance.
   - **PATCH**: Clarifications, wording, typo fixes.

All PRs and reviews MUST verify compliance with these principles.
Complexity beyond what is specified MUST be justified in writing.
Use `CLAUDE.md` for runtime development guidance.

**Version**: 2.0.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-14
