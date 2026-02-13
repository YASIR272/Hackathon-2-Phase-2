# Feature Specification: Todo Application Backend

**Feature Branch**: `002-todo-backend`
**Created**: 2026-02-09
**Status**: Draft
**Input**: User description: "/sp.specify
Project: Todo Full-Stack Web Application – Backend Implementation
What aspects should I focus on for the backend?
Key focus areas for FastAPI backend:

Database setup: Connect to Neon Serverless PostgreSQL using SQLModel ORM, initialize schema with tables for users (if needed, but Better Auth manages users) and tasks (id, user_id, title, description, completed, created_at, updated_at)
Models: Define SQLModel classes for Task, with relationships (user_id as foreign key), indexes for user_id and completed
API Endpoints: Implement all RESTful routes as specified (/api/{user_id}/tasks for GET/POST, /api/{user_id}/tasks/{id} for GET/PUT/DELETE, /api/{user_id}/tasks/{id}/complete for PATCH), with full CRUD + toggle complete
Authentication Integration: Add JWT verification middleware using shared BETTER_AUTH_SECRET (value: NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH), extract user_id from token, enforce user isolation on all operations (filter queries by authenticated user_id, 401 on invalid/missing token)
Error Handling: Use HTTPException for 404 (task not found), 403 (not owner), 400 (validation), with JSON responses
Database Operations: Use SQLModel sessions for CRUD, auto-timestamps, filtering by status/sort as per specs (query params: status="all|pending|completed", sort="created|title|due_date" if due_date added)
Integration with Frontend: Ensure API responses match frontend expectations (JSON Task objects), handle CORS for localhost:3000 (frontend dev), use DATABASE_URL from env (local: file:./db.sqlite for testing, production: postgresql://neondb_owner:npg_vbGNx8Ppi1XL@ep-still-paper-a1jkrkvc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require)
Additional Polish: Add logging for auth failures, rate limiting if possible, but keep minimal; support multi-user by associating tasks with user_id from JWT

Which resonates with your goals?
I'm focusing on building the full backend now, including DB setup, all API endpoints, JWT auth verification, and seamless integration with the existing frontend (e.g., token passing, user_id matching, CORS). Use the provided .env values for secrets and DB URLs to ensure successful integration.
What would success look like for this backend?
For the backend, success criteria might be:

All 6 API endpoints fully implemented and tested (GET list, POST create, GET details, PUT update, DELETE delete, PATCH toggle)
JWT auth works: Valid token required for all calls, decodes to user_id, filters tasks to only that user (no cross-user access)
Database persists data: Tasks saved across restarts, using Neon URL for cloud persistence (fallback to local SQLite for dev)
Integration success: Frontend can call APIs with Bearer token, get 200 OK for own tasks, 401/403 for invalid/auth issues
User isolation enforced: Every query filters by user_id from JWT, ownership checks on update/delete
Handles edge cases: Empty task list, invalid IDs (404), missing fields (400), token expiry (401)
Performance: Quick responses, proper indexing for filters/sorts
Logs and security: No plaintext secrets, env-loaded BETTER_AUTH_SECRET, SSL for Neon connection

What constraints should I consider?
Key constraints for backend:

Stack: FastAPI, SQLModel, Pydantic for models/validation
Database: Neon PostgreSQL primary (use provided Neon_db_url with sslmode=require), local SQLite fallback via DATABASE_URL
Auth: Verify JWT with shared secret (NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH), no session DB needed – stateless
API Structure: Routes under /api/, use {user_id} in path but verify against JWT user_id for security
Environment: Load from .env (BETTER_AUTH_SECRET, DATABASE_URL/Neon_db_url), add CORS middleware for frontend origins
Scope boundaries: No frontend code changes; assume frontend sends correct tokens/headers; no advanced features like pagination yet
Code Patterns: Follow @backend/CLAUDE.md (main.py entry, models.py, routes/, db.py connection)
Dependencies: Minimal – fastapi, sqlmodel, pydantic, pyjwt (for JWT), python-dotenv for env
Testing: Basic manual tests via curl/Postman for endpoints, validate against @specs/api/rest-endpoints.md and @specs/database/schema.md acceptance criteria"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Personal Tasks (Priority: P1)

A user wants to manage their personal tasks through a web interface. They need to be able to create new tasks, view their existing tasks, update task details, mark tasks as complete, and delete tasks they no longer need.

**Why this priority**: This is the core functionality of the todo application - without the ability to manage tasks, the application has no value to users.

**Independent Test**: Can be fully tested by creating a task through the API, retrieving it, updating its details, marking it complete, and deleting it - all operations deliver immediate value to the user.

**Acceptance Scenarios**:

1. **Given** a user has a valid JWT token, **When** they send a POST request to create a new task, **Then** the system should create the task associated with their user_id and return the task details
2. **Given** a user has existing tasks, **When** they send a GET request to retrieve their tasks, **Then** the system should return only their tasks and not tasks belonging to other users
3. **Given** a user has an existing task, **When** they send a PUT request to update the task, **Then** the system should update the task details and return the updated task
4. **Given** a user has an existing task, **When** they send a PATCH request to toggle completion status, **Then** the system should update the completion status of the task
5. **Given** a user has an existing task, **When** they send a DELETE request to remove the task, **Then** the system should delete the task and return a success response

---

### User Story 2 - Secure Access Control (Priority: P1)

A user should only be able to access and modify their own tasks. The system must prevent users from viewing or modifying tasks belonging to other users, and must reject requests without valid authentication.

**Why this priority**: Security is critical for any application that stores user data. Without proper access controls, users' private information could be exposed to others.

**Independent Test**: Can be fully tested by attempting to access tasks with valid and invalid authentication tokens, and by attempting to access another user's tasks - delivers protection of user privacy.

**Acceptance Scenarios**:

1. **Given** a user sends a request without a valid JWT token, **When** they attempt to access any task endpoint, **Then** the system should return a 401 Unauthorized error
2. **Given** a user has a valid JWT token, **When** they attempt to access a task that belongs to another user, **Then** the system should return a 403 Forbidden error
3. **Given** a user has a valid JWT token with an expired signature, **When** they attempt to access any task endpoint, **Then** the system should return a 401 Unauthorized error

---

### User Story 3 - Task Filtering and Organization (Priority: P2)

A user wants to be able to organize and filter their tasks to find specific items quickly. They need to be able to view tasks by completion status (all, pending, completed) and sort them by creation date or title.

**Why this priority**: While not essential for basic functionality, filtering and sorting capabilities significantly improve the user experience and make the application more useful.

**Independent Test**: Can be tested by creating multiple tasks with different statuses and titles, then requesting filtered and sorted lists - delivers improved task organization.

**Acceptance Scenarios**:

1. **Given** a user has tasks with different completion statuses, **When** they request tasks filtered by "completed" status, **Then** the system should return only completed tasks
2. **Given** a user has multiple tasks, **When** they request tasks sorted by creation date in descending order, **Then** the system should return tasks ordered from newest to oldest
3. **Given** a user has tasks with different titles, **When** they request tasks sorted alphabetically by title, **Then** the system should return tasks in alphabetical order

---

### Edge Cases

- What happens when a user sends a request with an invalid task ID (non-numeric or negative)?
- How does system handle requests with malformed JWT tokens?
- What happens when database connection fails during a request?
- How does the system behave when environment variables are missing or invalid?
- What occurs when a user tries to create a task with a title exceeding maximum length?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create new tasks with title, description, and completion status
- **FR-002**: System MUST store tasks with timestamps for creation and last update
- **FR-003**: System MUST associate each task with a user_id extracted from JWT authentication token
- **FR-004**: System MUST allow users to retrieve their tasks with filtering by completion status
- **FR-005**: System MUST allow users to update task details including title, description, and completion status
- **FR-006**: System MUST allow users to delete their own tasks
- **FR-007**: System MUST provide an endpoint to toggle task completion status
- **FR-008**: System MUST validate JWT tokens using shared secret for authentication
- **FR-009**: System MUST reject requests without valid authentication with 401 Unauthorized
- **FR-010**: System MUST reject requests to access or modify tasks belonging to other users with 403 Forbidden
- **FR-011**: System MUST return appropriate error responses (404, 400) for invalid requests
- **FR-012**: System MUST support database connections to both SQLite (development) and PostgreSQL (production)
- **FR-013**: System MUST handle CORS requests from configured frontend origins
- **FR-014**: System MUST provide consistent JSON response formats for all API endpoints
- **FR-015**: System MUST log authentication failures for security monitoring

### Key Entities

- **Task**: Represents a user's todo item with title, description, completion status, user association, and timestamps
- **User**: Represents an authenticated user identified by user_id extracted from JWT token (managed by external auth system)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can perform all task management operations (create, read, update, delete, toggle) with response times under 500ms
- **SC-002**: System correctly authenticates valid JWT tokens 99.9% of the time and rejects invalid tokens 100% of the time
- **SC-003**: User isolation is enforced with zero cross-user data access incidents during testing
- **SC-004**: All six required API endpoints function correctly with 100% success rate when tested manually with curl/Postman
- **SC-005**: Database persistence works reliably with 100% task data retention across application restarts
- **SC-006**: API responses match frontend expectations allowing seamless integration with existing UI components