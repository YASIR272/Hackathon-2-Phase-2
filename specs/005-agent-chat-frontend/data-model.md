# Data Model: OpenAI Agent, Chat Endpoint & ChatKit Frontend

**Feature**: 005-agent-chat-frontend
**Date**: 2026-02-15

## Entities

### Conversation (EXISTING — from Spec 1)

Already defined in `backend/models.py`. No schema changes needed.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | Integer | PK, auto-generated | |
| user_id | String | Indexed, required | Owner of the conversation |
| created_at | DateTime | NOT NULL, default CURRENT_TIMESTAMP | |
| updated_at | DateTime | NOT NULL, auto-updates | |

### Message (EXISTING — from Spec 1)

Already defined in `backend/models.py`. No schema changes needed.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | Integer | PK, auto-generated | |
| user_id | String | Indexed, required | Owner of the message |
| conversation_id | Integer | FK → Conversation.id, required | |
| role | String | max_length=20, required | "user" or "assistant" |
| content | Text | NOT NULL | Message text content |
| created_at | DateTime | NOT NULL, default CURRENT_TIMESTAMP | |

### Task (EXISTING — from Spec 1)

Unchanged. Accessed only through MCP tools.

## New Request/Response Schemas

### ChatRequest (new Pydantic model)

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| message | string | Yes | — | Non-empty, strip whitespace |
| conversation_id | integer | No | null | Must exist and belong to user if provided |

### ChatResponse (new Pydantic model)

| Field | Type | Description |
|-------|------|-------------|
| conversation_id | integer | The conversation ID (new or existing) |
| response | string | The assistant's text response |
| tool_calls | array | List of tool call objects `{tool_name, arguments, result}` |

### ToolCallInfo (new Pydantic model)

| Field | Type | Description |
|-------|------|-------------|
| tool_name | string | Name of the MCP tool called |
| arguments | object | Arguments passed to the tool |
| result | string | Tool's return value |

## Relationships

```
User (external, from JWT)
  ├── has many → Conversation
  │     └── has many → Message (ordered by created_at)
  └── has many → Task (accessed via MCP tools only)
```

## State Transitions

**Conversation lifecycle**:
1. Created: First message in a new conversation → new Conversation record
2. Active: Messages added with each request/response pair
3. No explicit "closed" state — conversations are always resumable

**Message lifecycle**:
1. User message stored → before agent processes
2. Assistant message stored → after agent completes
3. Messages are immutable once created
