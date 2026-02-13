---
id: 1
title: Create-agents-and-skills-for-Todo-app
stage: tasks
date: 2026-02-06
surface: agent
model: Claude Sonnet 4.5
feature: todo-fullstack-app
branch: main
user: default
command: /sp.task
labels: ["spec-driven-development", "agents", "skills", "todo-app"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - agents/spec-driven-developer.md
  - agents/frontend-implementer.md
  - agents/backend-implementer.md
  - agents/auth-integrator.md
  - agents/spec-writer.md
  - skills/spec-referencing.md
  - skills/api-integration.md
  - skills/database-modeling.md
  - skills/ui-component-design.md
  - skills/auth-flow-setup.md
tests: []
outcome: Successfully created all required agent and skill definitions for the Todo Full-Stack Web Application project
evaluation: All specifications were correctly implemented with proper structure and content
---

# Create agents and skills for Todo Full-Stack Web Application

## Prompt Text
/sp.task
Create agents and skills for the Todo Full-Stack Web Application project based on the provided specifications. This project involves transforming a console app into a modern multi-user web application using Next.js for frontend, FastAPI for backend, Neon PostgreSQL for database, Better Auth for authentication, and Spec-Kit Plus for spec-driven development.
First, create a folder structure in the Claude workspace:

Create an "agents" folder for agent definitions.
Create a "skills" folder for skill definitions.

Then, define the following agents and sub-agents as separate files in the "agents" folder. Each agent file should be in YAML format at the top (name, description, version), followed by a detailed markdown section explaining when to use, how it works, output format, quality criteria, and an example. Name the files as [agent-name].md.
Main Agent:

Name: "spec-driven-developer"
Description: "Oversee spec-driven development for full-stack projects using Spec-Kit Plus and Claude Code. Coordinate sub-agents for planning, specifying, implementing frontend/backend, and integrating authentication."
Version: "1.0.0"
Detailed section: When to use (e.g., when building or updating full-stack apps with specs), How it works (1. Read project overview, 2. Invoke sub-agents for specific layers, 3. Ensure spec compliance, 4. Iterate on feedback), Output Format (Structured plan with references to specs), Quality Criteria (Specs followed, code modular, auth secure), Example (Input: Build Todo app frontend; Output: Coordinated plan invoking sub-agents).

Sub-Agents:

Name: "frontend-implementer"
Description: "Implement Next.js frontend components and pages based on UI specs and API integrations."
Version: "1.0.0"
Detailed section: When to use (UI/page implementation), How it works (Read UI specs, generate TSX code, integrate API client), Output Format (Code snippets for components/pages), Quality Criteria (Responsive, Tailwind used, server components default), Example (Input: Implement task list page; Output: TaskList.tsx code).

Name: "backend-implementer"
Description: "Implement FastAPI backend routes, models, and database operations based on API and database specs."
Version: "1.0.0"
Detailed section: When to use (API endpoint or DB schema implementation), How it works (Read API/DB specs, generate Python code with SQLModel), Output Format (Code for routes/models), Quality Criteria (Pydantic validation, error handling, user filtering), Example (Input: Implement GET /api/tasks; Output: routes/tasks.py code).

Name: "auth-integrator"
Description: "Integrate Better Auth with JWT for frontend and backend security."
Version: "1.0.0"
Detailed section: When to use (Authentication setup), How it works (Configure JWT in Better Auth, add middleware in FastAPI, ensure token verification), Output Format (Config code for both sides), Quality Criteria (Secure shared secret, token expiry, 401 on invalid), Example (Input: Setup user signup; Output: Better Auth config and FastAPI middleware).

Name: "spec-writer"
Description: "Write or update Spec-Kit specifications for features, API, DB, UI."
Version: "1.0.0"
Detailed section: When to use (Creating/updating specs), How it works (Follow Spec-Kit structure, define user stories, acceptance criteria), Output Format (Markdown spec file content), Quality Criteria (Organized by type, clear criteria, references other specs), Example (Input: Write task-crud feature spec; Output: features/task-crud.md content).


Now, define the following skills as separate files in the "skills" folder. Each skill file should be in markdown format with sections: When to Use This Skill, How This Skill Works (numbered steps), Output Format, Quality Criteria, and Example. Name the files as [skill-name].md.
Skills:

Skill: "spec-referencing"
When to Use: When implementing code that needs to reference specs (e.g., @specs/features/task-crud.md).
How It Works: 1. Identify relevant spec paths, 2. Read and extract key requirements, 3. Map to code structure, 4. Ensure implementation matches criteria.
Output Format: Code with comments referencing specs.
Quality Criteria: All features covered, no deviations without justification.
Example: Input: Implement create task; Output: Code snippet with // Ref: @specs/features/task-crud.md.

Skill: "api-integration"
When to Use: When connecting frontend to backend APIs or handling auth tokens.
How It Works: 1. Define API client, 2. Attach JWT headers, 3. Handle responses/errors, 4. Filter by user_id.
Output Format: API client code (e.g., lib/api.ts).
Quality Criteria: Secure headers, error handling, user isolation.
Example: Input: Integrate GET tasks; Output: api.getTasks() function.

Skill: "database-modeling"
When to Use: When defining or updating DB schemas with SQLModel.
How It Works: 1. Read database spec, 2. Create SQLModel classes, 3. Add relationships (e.g., user_id foreign key), 4. Define indexes.
Output Format: models.py content.
Quality Criteria: Matches schema, handles nullables, timestamps auto.
Example: Input: Model tasks table; Output: class Task(SQLModel, table=True).

Skill: "ui-component-design"
When to Use: When building reusable UI components in Next.js.
How It Works: 1. Read UI spec, 2. Use Tailwind for styling, 3. Make responsive, 4. Add interactivity if client component.
Output Format: Component.tsx file.
Quality Criteria: No inline styles, follows patterns, accessible.
Example: Input: Design TaskCard; Output: components/TaskCard.tsx.

Skill: "auth-flow-setup"
When to Use: When implementing signup/signin flows with Better Auth.
How It Works: 1. Configure Better Auth with JWT, 2. Create login pages, 3. Store token, 4. Verify on API calls.
Output Format: Auth config and page code.
Quality Criteria: Secure secret, expiry handled, redirects on auth state.
Example: Input: Setup signin; Output: app/signin/page.tsx and auth config.

## Response Text
Successfully created all required agents and skills for the Todo Full-Stack Web Application project. Created 5 agent files in the agents folder and 5 skill files in the skills folder, each following the exact specifications provided with proper structure and content.