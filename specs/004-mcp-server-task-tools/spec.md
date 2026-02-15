# Feature Specification: MCP Server and All Task Tools

**Feature Branch**: `004-mcp-server-task-tools`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Build a standalone MCP server using the Official MCP Python SDK that exposes five required tools (add_task, list_tasks, complete_task, delete_task, update_task), all backed by the database from Spec 1."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - MCP Server Discovery and Tool Listing (Priority: P1)

As an AI agent connecting to the MCP server, I need to discover
all available tools and their schemas so that I know which
operations I can perform on behalf of the user.

**Why this priority**: Without a running, discoverable MCP server,
no tool can be invoked. This is the foundational proof-of-life
for the entire MCP integration.

**Independent Test**: Can be fully tested by starting the MCP
server, connecting a client, and requesting the tools list —
verifying all five tools are returned with correct names,
descriptions, and parameter schemas.

**Acceptance Scenarios**:

1. **Given** the MCP server is started with a valid database
   connection, **When** a client requests the list of available
   tools, **Then** five tools are returned: add_task, list_tasks,
   complete_task, delete_task, update_task.

2. **Given** the MCP server is running, **When** a client
   requests the schema for any tool, **Then** the response
   includes the tool name, description, and a valid parameter
   schema with correct types and required/optional markers.

3. **Given** the MCP server is started without a valid database
   connection, **When** the server attempts to initialize,
   **Then** it fails with a clear error message indicating the
   database is unavailable.

---

### User Story 2 - Adding a Task via MCP Tool (Priority: P1)

As an AI agent acting on behalf of an authenticated user, I need
to create a new task by calling the add_task tool so that the
user's to-do item is persisted in the database.

**Why this priority**: Task creation is the most fundamental
operation. Without it, the chatbot cannot help users manage
their todos.

**Independent Test**: Can be fully tested by calling add_task
with a user_id and title, then querying the database to confirm
the task was created with correct attributes.

**Acceptance Scenarios**:

1. **Given** a valid user_id and task title, **When** add_task
   is called, **Then** a new task is created in the database
   and the response contains the task_id, status "created",
   and the title.

2. **Given** a valid user_id, title, and optional description,
   **When** add_task is called, **Then** the task is created
   with both title and description stored.

3. **Given** add_task is called with user_id "alice" and then
   with user_id "bob", **When** each user's tasks are queried,
   **Then** each user only sees their own task — tasks are
   isolated by user_id.

4. **Given** add_task is called without a required parameter
   (e.g., missing title), **When** the tool processes the
   request, **Then** an error response is returned indicating
   the missing parameter.

---

### User Story 3 - Listing Tasks via MCP Tool (Priority: P1)

As an AI agent acting on behalf of a user, I need to retrieve
the user's tasks by calling the list_tasks tool so that the
chatbot can show the user what they need to do.

**Why this priority**: Listing tasks is the most frequently
used operation and essential for the chatbot to provide
context-aware responses.

**Independent Test**: Can be fully tested by creating several
tasks for a user, then calling list_tasks with various status
filters and verifying correct results.

**Acceptance Scenarios**:

1. **Given** a user has 3 pending and 2 completed tasks,
   **When** list_tasks is called with status "all",
   **Then** all 5 tasks are returned.

2. **Given** a user has 3 pending and 2 completed tasks,
   **When** list_tasks is called with status "pending",
   **Then** only the 3 pending tasks are returned.

3. **Given** a user has 3 pending and 2 completed tasks,
   **When** list_tasks is called with status "completed",
   **Then** only the 2 completed tasks are returned.

4. **Given** a user has no tasks, **When** list_tasks is
   called, **Then** an empty array is returned.

5. **Given** user "alice" has 3 tasks and user "bob" has 2
   tasks, **When** list_tasks is called for "alice",
   **Then** only alice's 3 tasks are returned — no cross-user
   data leakage.

6. **Given** list_tasks is called without a status parameter,
   **When** the tool processes the request, **Then** it
   defaults to returning all tasks.

---

### User Story 4 - Completing a Task via MCP Tool (Priority: P2)

As an AI agent acting on behalf of a user, I need to mark a
task as complete by calling the complete_task tool so that the
user can track their progress.

**Why this priority**: Completing tasks is the core value
proposition of a todo app, but requires tasks to exist first.

**Independent Test**: Can be fully tested by creating a task,
calling complete_task with its ID, and verifying the task's
completed field is set to true in the database.

**Acceptance Scenarios**:

1. **Given** a pending task with id 3 belonging to the user,
   **When** complete_task is called with user_id and task_id 3,
   **Then** the task is marked as completed and the response
   contains task_id 3, status "completed", and the task title.

2. **Given** a task_id that does not exist, **When**
   complete_task is called, **Then** an error response is
   returned indicating "task not found".

3. **Given** a task that belongs to user "alice", **When**
   user "bob" calls complete_task for that task_id,
   **Then** an error response is returned — users cannot
   complete other users' tasks.

---

### User Story 5 - Deleting a Task via MCP Tool (Priority: P2)

As an AI agent acting on behalf of a user, I need to remove a
task by calling the delete_task tool so that the user can clean
up their task list.

**Why this priority**: Deletion is important for task list
hygiene but is less frequent than creation and listing.

**Independent Test**: Can be fully tested by creating a task,
calling delete_task with its ID, and verifying the task no
longer exists in the database.

**Acceptance Scenarios**:

1. **Given** a task with id 2 belonging to the user,
   **When** delete_task is called with user_id and task_id 2,
   **Then** the task is removed from the database and the
   response contains task_id 2, status "deleted", and the
   task title.

2. **Given** a task_id that does not exist, **When**
   delete_task is called, **Then** an error response is
   returned indicating "task not found".

3. **Given** a task that belongs to user "alice", **When**
   user "bob" calls delete_task for that task_id,
   **Then** an error response is returned — users cannot
   delete other users' tasks.

---

### User Story 6 - Updating a Task via MCP Tool (Priority: P2)

As an AI agent acting on behalf of a user, I need to modify a
task's title or description by calling the update_task tool so
that the user can refine their task details.

**Why this priority**: Updating is a convenience operation that
enhances the user experience but is not strictly required for
the core workflow.

**Independent Test**: Can be fully tested by creating a task,
calling update_task with a new title and/or description, and
verifying the changes are persisted in the database.

**Acceptance Scenarios**:

1. **Given** a task with id 1 belonging to the user,
   **When** update_task is called with a new title,
   **Then** the task title is updated and the response
   contains task_id 1, status "updated", and the new title.

2. **Given** a task with id 1 belonging to the user,
   **When** update_task is called with a new description only,
   **Then** only the description is updated; the title remains
   unchanged.

3. **Given** a task with id 1 belonging to the user,
   **When** update_task is called with both a new title and
   description, **Then** both fields are updated.

4. **Given** a task_id that does not exist, **When**
   update_task is called, **Then** an error response is
   returned indicating "task not found".

5. **Given** a task that belongs to user "alice", **When**
   user "bob" calls update_task for that task_id,
   **Then** an error response is returned — users cannot
   update other users' tasks.

---

### Edge Cases

- What happens when a tool is called with an invalid or
  non-integer task_id? The system MUST return a clear error
  message, not crash.
- What happens when add_task is called with an extremely long
  title (over 255 characters)? The system MUST reject it with
  a validation error.
- What happens when two concurrent requests try to complete
  the same task simultaneously? The system MUST handle this
  gracefully — both succeed or one succeeds and the other
  gets a consistent response.
- What happens when the database connection is lost during a
  tool call? The system MUST return an error response, not
  hang indefinitely.
- What happens when list_tasks is called with an invalid
  status value (not "all", "pending", or "completed")? The
  system MUST return a validation error.
- What happens when update_task is called with no fields to
  update (neither title nor description provided)? The system
  MUST return a validation error or a no-op acknowledgment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a standalone MCP server that
  starts, accepts connections, and responds to tool discovery
  requests.
- **FR-002**: System MUST register exactly five tools:
  add_task, list_tasks, complete_task, delete_task, update_task.
- **FR-003**: System MUST expose each tool with a complete
  parameter schema including parameter names, types, required
  flags, and descriptions.
- **FR-004**: The add_task tool MUST accept user_id (string,
  required), title (string, required), and description (string,
  optional) and return an object with task_id, status "created",
  and title.
- **FR-005**: The list_tasks tool MUST accept user_id (string,
  required) and status (string, optional: "all", "pending",
  "completed") and return an array of task objects with id,
  title, and completed fields.
- **FR-006**: The complete_task tool MUST accept user_id
  (string, required) and task_id (integer, required) and return
  an object with task_id, status "completed", and title.
- **FR-007**: The delete_task tool MUST accept user_id (string,
  required) and task_id (integer, required) and return an object
  with task_id, status "deleted", and title.
- **FR-008**: The update_task tool MUST accept user_id (string,
  required), task_id (integer, required), title (string,
  optional), and description (string, optional) and return an
  object with task_id, status "updated", and title.
- **FR-009**: All tools MUST scope database queries by user_id
  so that no user can access, modify, or delete another user's
  tasks.
- **FR-010**: All tools MUST return appropriate error responses
  when a referenced task does not exist or does not belong to
  the requesting user.
- **FR-011**: All tools MUST be stateless — they read from and
  write to the database on every call, holding no in-memory
  state between invocations.
- **FR-012**: The MCP server MUST share the same database
  engine and connection configuration as the main backend
  (defined in Spec 1).
- **FR-013**: The MCP server MUST validate input parameters
  before executing database operations (e.g., reject missing
  required fields, invalid types, empty titles).
- **FR-014**: The list_tasks tool MUST default to returning
  all tasks when the status parameter is omitted.

### Key Entities

- **Task**: Represents a user's to-do item. Attributes: id
  (integer, auto-generated), user_id (string), title (string),
  description (string, optional), completed (boolean), created_at
  (datetime), updated_at (datetime). Each task belongs to exactly
  one user. All tool operations are scoped by user_id.

### Assumptions

- The database models and engine from Spec 1 (003-core-backend-auth)
  are already implemented and available for import.
- The Task model follows the schema defined in Spec 1, including
  fields for priority and due_date, though MCP tools in this spec
  do not expose those fields (they may be added in future specs).
- The MCP server runs as part of the same backend process or as a
  co-located service that can import the shared database module.
- user_id is always a string, consistent with Spec 1's
  authentication design.
- The MCP server communicates via stdio transport for local
  development and agent integration.
- The "status" parameter in list_tasks maps to the Task model's
  "completed" boolean field: "pending" = completed is false,
  "completed" = completed is true, "all" = no filter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five tools are discoverable — a client connecting
  to the MCP server retrieves exactly 5 tools with correct names
  and schemas on 100% of discovery requests.
- **SC-002**: Task creation succeeds on first attempt — calling
  add_task with valid parameters results in a persisted task
  100% of the time.
- **SC-003**: Task listing returns accurate results — list_tasks
  returns the correct count and correct tasks for each status
  filter with 100% accuracy.
- **SC-004**: Multi-user isolation is enforced — in a test with
  2+ users, zero cross-user data leakage occurs across all tool
  operations.
- **SC-005**: Error cases are handled gracefully — 100% of
  "task not found", invalid parameter, and unauthorized access
  scenarios return structured error responses (not crashes or
  unhandled exceptions).
- **SC-006**: Tool operations complete within 2 seconds under
  normal conditions for single-user workloads.
