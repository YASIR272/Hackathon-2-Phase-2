# Feature Specification: OpenAI Agent, Chat Endpoint, Conversation Management & ChatKit Frontend

**Feature Branch**: `005-agent-chat-frontend`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Wire the full AI chatbot experience — stateless chat endpoint, OpenAI Agents SDK agent (using MCP tools), conversation history persistence in DB, OpenAI ChatKit frontend embedding, UI customization, and integration with existing project agents."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chat Endpoint Processes Messages and Returns AI Responses (Priority: P1)

As a frontend client sending a user message to the chat
endpoint, I need the server to accept my message, run it
through the AI agent with MCP tool access, and return the
assistant's response along with any tool calls made — so
that the user sees an intelligent, context-aware reply.

**Why this priority**: Without a working chat endpoint that
connects the AI agent to MCP tools, there is no chatbot.
This is the foundational capability that everything else
depends on.

**Independent Test**: Can be fully tested by sending a POST
request to the chat endpoint with a user message like "Add
a task to buy groceries" and verifying the response contains
the assistant's confirmation text and a tool_calls array
showing add_task was invoked.

**Acceptance Scenarios**:

1. **Given** a valid authenticated user, **When** a POST
   request is sent to the chat endpoint with a message and
   no conversation_id, **Then** a new conversation is created,
   the message is processed by the AI agent, and the response
   includes a new conversation_id, the assistant's text
   response, and a tool_calls array.

2. **Given** a valid authenticated user with an existing
   conversation, **When** a POST request is sent with a
   message and an existing conversation_id, **Then** the
   conversation history is loaded from the database, the new
   message is appended, the agent processes with full context,
   and the response continues the conversation.

3. **Given** the user says "Add a task to buy groceries",
   **When** the agent processes the message, **Then** the
   agent calls the add_task MCP tool and responds with a
   friendly confirmation like "I've added 'Buy groceries'
   to your task list."

4. **Given** the user says "Show me all my tasks", **When**
   the agent processes the message, **Then** the agent calls
   list_tasks with status "all" and presents the tasks in a
   readable format.

5. **Given** the user sends a message with an empty or
   missing message field, **When** the endpoint processes
   the request, **Then** a validation error response is
   returned with an appropriate error message.

6. **Given** the agent encounters an error from an MCP tool
   (e.g., task not found), **When** it processes the error
   response, **Then** the agent provides a graceful,
   user-friendly error message rather than exposing raw
   error details.

---

### User Story 2 - Conversation History Persistence and Resumption (Priority: P1)

As a user returning to the chatbot after a server restart
or session break, I need my previous conversation to be
preserved and resumable so that I do not lose context and
can continue where I left off.

**Why this priority**: Stateless architecture is a core
constitution principle. Without conversation persistence,
every request would be treated as a new conversation,
breaking the user experience.

**Independent Test**: Can be fully tested by sending several
messages in a conversation, restarting the server, then
sending a follow-up message with the same conversation_id
and verifying the agent has access to the full prior context.

**Acceptance Scenarios**:

1. **Given** a user sends a message to the chat endpoint,
   **When** the message is processed, **Then** both the
   user's message and the assistant's response are stored
   in the database with the correct conversation_id, role,
   and content.

2. **Given** a user has an existing conversation with 5
   messages, **When** a new message is sent with that
   conversation_id, **Then** all 5 previous messages are
   loaded from the database and included in the agent's
   context before processing the new message.

3. **Given** a server restart occurs between two messages
   in the same conversation, **When** the user sends a
   follow-up message with the same conversation_id,
   **Then** the conversation continues seamlessly with
   full history intact.

4. **Given** a user provides a conversation_id that does
   not exist or belongs to another user, **When** the
   endpoint processes the request, **Then** an error
   response is returned indicating the conversation was
   not found.

5. **Given** a user starts a new conversation (no
   conversation_id provided), **When** the first message
   is processed, **Then** a new conversation record is
   created in the database and the new conversation_id
   is returned in the response.

---

### User Story 3 - Agent Routes Natural Language to MCP Tools (Priority: P1)

As a user communicating in natural language, I need the AI
agent to correctly interpret my intent and invoke the
appropriate MCP tool(s) so that my tasks are managed without
me needing to know the underlying tool names or parameters.

**Why this priority**: The agent's ability to understand
natural language and map it to tool calls is the core value
proposition of the AI chatbot.

**Independent Test**: Can be fully tested by sending various
natural language commands (add, list, complete, delete,
update) and verifying the correct MCP tool is called with
the correct parameters each time.

**Acceptance Scenarios**:

1. **Given** the user says "Add a task to buy groceries",
   **When** the agent processes it, **Then** add_task is
   called with title "Buy groceries" and the response
   confirms the creation.

2. **Given** the user says "What's pending?", **When** the
   agent processes it, **Then** list_tasks is called with
   status "pending" and results are presented readably.

3. **Given** the user says "Mark task 3 as complete",
   **When** the agent processes it, **Then** complete_task
   is called with task_id 3 and the response confirms
   completion.

4. **Given** the user says "Delete the meeting task",
   **When** the agent processes it, **Then** the agent
   calls list_tasks first to find the task, then calls
   delete_task with the correct task_id.

5. **Given** the user says "Change task 1 to 'Call mom
   tonight'", **When** the agent processes it, **Then**
   update_task is called with task_id 1 and the new title.

6. **Given** the user says "I need to remember to pay
   bills", **When** the agent processes it, **Then**
   add_task is called with title "Pay bills" (the agent
   recognizes implicit task creation intent).

7. **Given** the user says "What have I completed?",
   **When** the agent processes it, **Then** list_tasks
   is called with status "completed".

8. **Given** the agent needs to confirm an action, **When**
   it responds, **Then** the response is friendly and
   conversational (e.g., "Done! I've marked 'Buy groceries'
   as complete.") rather than raw JSON.

---

### User Story 4 - ChatKit Frontend Displays Chat Interface (Priority: P2)

As a user visiting the application, I need to see a polished
chat interface powered by OpenAI ChatKit that lets me type
messages, see responses, and view tool call activity — so
that the chatbot experience feels professional and intuitive.

**Why this priority**: The frontend is essential for user
interaction but depends on the backend chat endpoint being
functional first.

**Independent Test**: Can be fully tested by opening the
frontend URL, typing a message in the ChatKit input,
submitting it, and verifying the response appears in the
chat thread with any tool calls visually indicated.

**Acceptance Scenarios**:

1. **Given** a user opens the application URL, **When** the
   page loads, **Then** the ChatKit chat interface is
   displayed with an input field and message area.

2. **Given** the ChatKit interface is loaded, **When** the
   user types a message and submits it, **Then** the message
   is sent to the backend chat endpoint and the assistant's
   response appears in the chat thread.

3. **Given** the agent invokes MCP tools during a response,
   **When** the response is displayed, **Then** the tool
   calls are visually indicated (e.g., showing which tools
   were used and their results).

4. **Given** the backend is processing a message, **When**
   the user is waiting for a response, **Then** a loading
   indicator is shown to communicate that the system is
   working.

5. **Given** the backend returns an error, **When** the
   error response reaches the frontend, **Then** a
   user-friendly error message is displayed rather than
   raw error data.

6. **Given** the user is on a mobile device, **When** the
   chat interface is displayed, **Then** the layout adapts
   responsively to the smaller screen size.

---

### User Story 5 - ChatKit UI Customization and Theming (Priority: P3)

As a product stakeholder, I need the ChatKit interface to
match the application's visual identity with custom theming,
layout adjustments, and polished micro-interactions — so
that the chatbot feels like an integral part of the
application rather than a generic embed.

**Why this priority**: Visual polish enhances the user
experience but is not required for core functionality.

**Independent Test**: Can be fully tested by comparing the
ChatKit appearance against the design requirements —
verifying theme colors, font choices, spacing, and visual
hierarchy match the application's style guide.

**Acceptance Scenarios**:

1. **Given** the ChatKit interface is loaded, **When** the
   user views it, **Then** the theme (colors, typography,
   spacing) matches the application's visual identity.

2. **Given** the application supports dark and light themes,
   **When** the user toggles the theme, **Then** the ChatKit
   interface updates accordingly.

3. **Given** the user interacts with the chat interface,
   **When** messages are sent and received, **Then** subtle
   animations and transitions provide visual feedback.

4. **Given** the application is deployed to a production
   domain, **When** ChatKit loads, **Then** the domain
   allowlist is correctly configured and ChatKit functions
   without security errors.

---

### User Story 6 - Multi-User Isolation in Chat (Priority: P1)

As an authenticated user, I need my conversations and task
operations to be completely isolated from other users — so
that no one can see my messages, access my tasks, or
interfere with my conversations.

**Why this priority**: Multi-user isolation is a core
constitution principle and a security requirement.

**Independent Test**: Can be fully tested by creating
conversations and tasks for two different users, then
verifying neither can access the other's data through
the chat endpoint.

**Acceptance Scenarios**:

1. **Given** user Alice has a conversation with 3 messages,
   **When** user Bob requests conversations, **Then** Bob
   cannot see Alice's conversation or messages.

2. **Given** user Alice asks the agent to "Show all my
   tasks", **When** the agent calls list_tasks, **Then**
   only Alice's tasks are returned — Bob's tasks are
   never visible.

3. **Given** user Bob attempts to resume Alice's
   conversation by providing her conversation_id, **When**
   the endpoint processes the request, **Then** an error
   is returned indicating the conversation was not found
   (ownership check).

4. **Given** the chat endpoint extracts user_id from the
   authenticated session, **When** the user_id is passed
   to the AI agent, **Then** the agent passes the same
   user_id to every MCP tool call, ensuring tool-level
   isolation.

---

### Edge Cases

- What happens when the AI agent takes longer than 30
  seconds to respond? The system MUST return a timeout
  error rather than hanging indefinitely.
- What happens when the MCP server is unreachable? The
  system MUST return a clear error message indicating
  tool unavailability.
- What happens when the conversation history is very long
  (100+ messages)? The system MUST handle this gracefully,
  potentially truncating older messages to fit within the
  agent's context window.
- What happens when the user sends multiple rapid messages?
  The system MUST process them sequentially per conversation,
  preventing race conditions on conversation state.
- What happens when the ChatKit frontend loses connection
  to the backend? The system MUST display a user-friendly
  offline/retry message.
- What happens when an authenticated user's token expires
  mid-conversation? The system MUST return an authentication
  error, prompting the frontend to refresh the token or
  redirect to login.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a chat endpoint at
  `POST /api/{user_id}/chat` that accepts a JSON body
  with `message` (required, string) and `conversation_id`
  (optional, integer).

- **FR-002**: System MUST return a JSON response containing
  `conversation_id` (integer), `response` (string — the
  assistant's message), and `tool_calls` (array — list of
  MCP tools invoked during processing).

- **FR-003**: System MUST create a new conversation record
  in the database when no `conversation_id` is provided
  in the request.

- **FR-004**: System MUST load the full conversation history
  from the database when an existing `conversation_id` is
  provided, and include all prior messages in the agent's
  context.

- **FR-005**: System MUST store the user's message in the
  database before processing it through the agent.

- **FR-006**: System MUST store the assistant's response
  in the database after the agent completes processing.

- **FR-007**: System MUST configure an AI agent using the
  OpenAI Agents SDK with access to the 5 MCP tools
  (add_task, list_tasks, complete_task, delete_task,
  update_task) via the MCP server.

- **FR-008**: The AI agent MUST correctly route natural
  language commands to the appropriate MCP tool(s) based
  on user intent, following the Agent Behavior Specification.

- **FR-009**: The AI agent MUST generate friendly,
  conversational responses that confirm actions taken
  rather than returning raw tool output.

- **FR-010**: System MUST validate that the conversation_id
  (when provided) belongs to the authenticated user before
  loading history.

- **FR-011**: System MUST pass the authenticated user_id
  to the agent, which in turn passes it to every MCP tool
  call for user isolation.

- **FR-012**: The chat endpoint MUST remain completely
  stateless — all conversation state MUST be loaded from
  and persisted to the database on every request.

- **FR-013**: System MUST embed OpenAI ChatKit as the
  primary frontend chat interface, connected to the custom
  backend chat endpoint.

- **FR-014**: The ChatKit frontend MUST send the user's
  authenticated identity with each request to the backend.

- **FR-015**: The ChatKit UI MUST display tool call
  activity when the agent invokes MCP tools.

- **FR-016**: The ChatKit UI MUST show loading indicators
  while the backend processes messages.

- **FR-017**: The ChatKit UI MUST display user-friendly
  error messages when the backend returns errors.

- **FR-018**: System MUST validate that the `message` field
  is non-empty before processing.

- **FR-019**: The ChatKit domain allowlist configuration
  MUST be documented with step-by-step instructions for
  production deployment.

- **FR-020**: System MUST handle MCP server unavailability
  gracefully, returning a clear error message to the user.

### Key Entities

- **Conversation**: Represents a chat session between a
  user and the AI assistant. Attributes: id (auto-generated),
  user_id (owner), created_at, updated_at. Each user can
  have multiple conversations.

- **Message**: Represents a single message within a
  conversation. Attributes: id (auto-generated), user_id,
  conversation_id (links to Conversation), role ("user"
  or "assistant"), content (the message text), created_at.
  Messages are ordered chronologically within a conversation.

- **Task**: (Existing from Spec 1/2) Managed exclusively
  through MCP tools — the agent never accesses tasks
  directly.

### Assumptions

- The existing Better Auth + JWT authentication from Phase
  I/II is used to extract user_id from the request. The
  chat endpoint uses the same auth middleware.
- The MCP server from Spec 2 is started as a subprocess
  by the agent (stdio transport) and does not require a
  separate deployment step.
- OpenAI Agents SDK is used with the `openai-agents`
  Python package. The OPENAI_API_KEY environment variable
  must be configured.
- ChatKit is integrated using the official `@openai/chatkit`
  JavaScript library (React components or script embed).
- The frontend connects to the backend chat endpoint via
  REST (not WebSocket/streaming for MVP).
- Conversation history truncation strategy: most recent
  messages are kept when history exceeds the agent's context
  window (reasonable default: last 50 messages).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can send a natural language message
  and receive an AI-generated response with correct tool
  invocation within 10 seconds on first attempt.

- **SC-002**: Conversations persist across server restarts
  — sending a follow-up message after restart with the same
  conversation_id returns a contextually aware response.

- **SC-003**: All 8 natural language command examples from
  the Agent Behavior Specification are correctly routed to
  the appropriate MCP tool(s) with a 100% success rate.

- **SC-004**: Multi-user isolation is complete — two users
  with separate conversations see zero cross-user data
  leakage in tasks, conversations, or messages.

- **SC-005**: The ChatKit frontend loads, accepts user
  input, displays AI responses, and shows tool call
  activity for every message exchange.

- **SC-006**: All error scenarios (empty message, invalid
  conversation_id, MCP unavailable, auth failure) return
  structured, user-friendly error responses — zero raw
  exceptions exposed to the user.

- **SC-007**: The chat endpoint returns responses within 15
  seconds for typical messages (single-tool invocations)
  under normal conditions.

- **SC-008**: Domain allowlist configuration documentation
  is complete and a reviewer can follow the steps to deploy
  ChatKit on a new domain without additional guidance.
