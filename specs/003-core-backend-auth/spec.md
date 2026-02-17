# Feature Specification: Phase III – Core Backend, Database Models & Authentication

**Feature Branch**: `003-core-backend-auth`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Build the foundational FastAPI backend, Neon PostgreSQL connection, SQLModel ORM models, and Better Auth integration."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Server Health Check (Priority: P1)

As a deployment engineer, I need the FastAPI backend to start
successfully and expose a health endpoint so I can verify the
service is running and connected to the database.

**Why this priority**: Without a running server, no other feature
can function. This is the most fundamental proof of life.

**Independent Test**: Can be fully tested by sending a GET request
to the health endpoint and verifying a 200 response with database
connectivity status.

**Acceptance Scenarios**:

1. **Given** the server is started with valid environment variables,
   **When** a GET request is sent to `/health`,
   **Then** a 200 response is returned with status "healthy" and
   a database connectivity indicator.

2. **Given** the server is started with an invalid DATABASE_URL,
   **When** a GET request is sent to `/health`,
   **Then** a response is returned indicating database
   connectivity failure while the server itself remains running.

3. **Given** no environment variables are configured,
   **When** the server attempts to start,
   **Then** it fails fast with a clear error message listing the
   missing required variables.

---

### User Story 2 - Database Models & Schema Creation (Priority: P1)

As a backend developer, I need SQLModel ORM models for Task,
Conversation, and Message defined exactly as specified in the
Phase III requirements, with proper relationships, indexes, and
automatic timestamp management, so that the database schema
supports all downstream features (MCP tools, chat endpoint).

**Why this priority**: Models are the foundation that every other
layer depends on. MCP tools, the agent, and the chat endpoint
all read and write through these models.

**Independent Test**: Can be fully tested by running the schema
creation against a PostgreSQL database and verifying all tables,
columns, relationships, and indexes are created correctly.

**Acceptance Scenarios**:

1. **Given** a fresh PostgreSQL database,
   **When** the application initializes,
   **Then** the Task, Conversation, and Message tables are created
   with all specified columns, types, defaults, and indexes.

2. **Given** the database schema is created,
   **When** a Message record is created referencing a Conversation,
   **Then** the foreign key relationship is enforced and the
   message is linked to the correct conversation.

3. **Given** an existing database with data,
   **When** the application restarts,
   **Then** existing data is preserved (tables are not dropped
   and recreated).

---

### User Story 3 - Authentication & User Context (Priority: P1)

As an authenticated user, I need my identity (user_id) to be
extracted from my JWT token and available throughout the request
lifecycle so that all data operations are scoped to my account.

**Why this priority**: Multi-user isolation is a constitutional
principle. Without authentication, no data operation can be
safely scoped.

**Independent Test**: Can be fully tested by sending requests
with valid and invalid JWT tokens and verifying that user_id is
correctly extracted or the request is rejected.

**Acceptance Scenarios**:

1. **Given** a request with a valid Better Auth JWT token,
   **When** the request reaches a protected endpoint,
   **Then** the user_id is extracted from the token and available
   in the request context.

2. **Given** a request with an expired or invalid JWT token,
   **When** the request reaches a protected endpoint,
   **Then** a 401 Unauthorized response is returned with a clear
   error message.

3. **Given** a request with no Authorization header,
   **When** the request reaches a protected endpoint,
   **Then** a 401 Unauthorized response is returned.

4. **Given** a valid JWT token containing user_id as a string,
   **When** the user_id is passed to any data operation,
   **Then** the user_id type is string throughout (never cast
   to integer).

---

### User Story 4 - Environment Configuration (Priority: P2)

As a developer setting up the project, I need all configuration
to be driven by environment variables with sensible defaults for
development and clear documentation, so that the backend works
both locally and in production with minimal setup.

**Why this priority**: Reproducibility is a constitutional
principle, but the server and models must exist first.

**Independent Test**: Can be fully tested by starting the server
with different environment variable configurations and verifying
correct behavior in each case.

**Acceptance Scenarios**:

1. **Given** a `.env` file with DATABASE_URL set to a Neon
   PostgreSQL connection string,
   **When** the application starts,
   **Then** it connects to the Neon database using connection
   pooling.

2. **Given** a `.env` file with DATABASE_URL set to a local
   SQLite path,
   **When** the application starts,
   **Then** it connects to SQLite for local development.

3. **Given** a `.env.example` file in the backend directory,
   **When** a new developer reads it,
   **Then** every required and optional environment variable is
   listed with a description and example value.

---

### Edge Cases

- What happens when the database connection is lost mid-request?
  The server MUST return a 503 Service Unavailable and NOT crash.
- What happens when two requests try to create the schema
  simultaneously? The system MUST handle concurrent initialization
  gracefully (idempotent schema creation).
- What happens when the JWT secret does not match the token issuer?
  The system MUST return 401, not 500.
- What happens when user_id in the token is empty or null?
  The system MUST reject the request with 401.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a FastAPI application entry point
  that starts an async web server on a configurable host and port.
- **FR-002**: System MUST expose a `GET /health` endpoint that
  returns server status and database connectivity information
  without requiring authentication.
- **FR-003**: System MUST define a Task model with fields: id
  (auto-generated primary key), user_id (string, indexed), title
  (string, required), description (string, optional), completed
  (boolean, default false), created_at (datetime, auto-set),
  updated_at (datetime, auto-set on modification).
- **FR-004**: System MUST define a Conversation model with fields:
  id (auto-generated primary key), user_id (string, indexed),
  created_at (datetime, auto-set), updated_at (datetime, auto-set
  on modification).
- **FR-005**: System MUST define a Message model with fields: id
  (auto-generated primary key), user_id (string, indexed),
  conversation_id (foreign key to Conversation), role (string:
  "user" or "assistant"), content (text), created_at (datetime,
  auto-set).
- **FR-006**: System MUST create database indexes on user_id for
  Task, Conversation, and Message tables and a composite index on
  (user_id, completed) for Task.
- **FR-007**: System MUST enforce a foreign key relationship
  between Message.conversation_id and Conversation.id.
- **FR-008**: System MUST connect to Neon Serverless PostgreSQL
  using async connection pooling in production and support SQLite
  for local development.
- **FR-009**: System MUST create all database tables on startup
  if they do not already exist (idempotent schema initialization).
- **FR-010**: System MUST integrate Better Auth JWT verification
  to extract user_id from incoming request tokens.
- **FR-011**: System MUST provide a reusable FastAPI dependency
  that extracts and validates user_id from the Authorization
  header, returning 401 for missing, expired, or invalid tokens.
- **FR-012**: System MUST load all configuration from environment
  variables using a settings class, with DATABASE_URL as required
  and BETTER_AUTH_SECRET, HOST, PORT, and CORS origins as
  configurable.
- **FR-013**: System MUST configure CORS middleware to allow
  requests from configurable frontend origins.
- **FR-014**: System MUST organize code into a clear folder
  structure: models/, database/, auth/, routes/, and config
  modules within a /backend directory.

### Key Entities

- **Task**: Represents a user's to-do item. Attributes: id,
  user_id, title, description, completed, created_at, updated_at.
  Scoped to a single user. Indexed for fast filtered queries.
- **Conversation**: Represents a chat session between a user and
  the AI assistant. Attributes: id, user_id, created_at,
  updated_at. Groups related messages. Scoped to a single user.
- **Message**: Represents a single message within a conversation.
  Attributes: id, user_id, conversation_id, role, content,
  created_at. Linked to exactly one Conversation via foreign key.
  Role is either "user" or "assistant".

### Assumptions

- Better Auth JWT tokens use the HS256 algorithm and contain a
  `sub` or `userId` claim for user identification, consistent
  with the existing Phase II implementation.
- The existing Phase II backend folder will be adapted/extended
  for Phase III rather than creating a separate backend directory.
- SQLite remains the fallback for local development; Neon
  PostgreSQL is the production database.
- Connection pooling for Neon uses asyncpg with SQLAlchemy async
  engine configuration.
- The server port defaults to 8000 if not specified.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The server responds to health check requests within
  1 second of receiving them under normal conditions.
- **SC-002**: All three database tables (Task, Conversation,
  Message) are created successfully on first startup against a
  fresh PostgreSQL database.
- **SC-003**: Authenticated requests with valid tokens receive
  the correct user_id in every downstream operation with zero
  user_id mismatches.
- **SC-004**: Requests with invalid or missing tokens are rejected
  100% of the time with appropriate error responses.
- **SC-005**: The application starts and is ready to serve
  requests within 5 seconds on standard hardware.
- **SC-006**: A new developer can set up and run the backend
  by following the .env.example and README within 5 minutes.
