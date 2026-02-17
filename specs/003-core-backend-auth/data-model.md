# Data Model: Phase III – Core Backend

**Date**: 2026-02-14
**Branch**: `003-core-backend-auth`

## Entity Relationship Diagram

```
┌──────────────────────────────┐
│            Task              │
├──────────────────────────────┤
│ id          : int (PK, auto) │
│ user_id     : str (indexed)  │
│ title       : str (required) │
│ description : str (optional) │
│ completed   : bool (false)   │
│ created_at  : datetime (auto)│
│ updated_at  : datetime (auto)│
├──────────────────────────────┤
│ IDX: user_id                 │
│ IDX: (user_id, completed)    │
└──────────────────────────────┘

┌──────────────────────────────┐
│        Conversation          │
├──────────────────────────────┤
│ id          : int (PK, auto) │
│ user_id     : str (indexed)  │
│ created_at  : datetime (auto)│
│ updated_at  : datetime (auto)│
├──────────────────────────────┤
│ IDX: user_id                 │
└──────────────┬───────────────┘
               │ 1
               │
               │ *
┌──────────────┴───────────────┐
│          Message             │
├──────────────────────────────┤
│ id              : int (PK)   │
│ user_id         : str (idx)  │
│ conversation_id : int (FK)   │
│ role            : str        │
│ content         : text       │
│ created_at      : datetime   │
├──────────────────────────────┤
│ IDX: user_id                 │
│ FK: conversation_id →        │
│     Conversation.id          │
└──────────────────────────────┘
```

## Relationships

| From | To | Type | Constraint |
|------|----|------|-----------|
| Message | Conversation | Many-to-One | FK: conversation_id → Conversation.id |

## Field Specifications

### Task

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| id | Integer | No | Auto-increment | Primary key |
| user_id | String | No | — | Indexed; scopes all queries |
| title | String(255) | No | — | min_length=1, max_length=255 |
| description | String(1000) | Yes | None | max_length=1000 |
| completed | Boolean | No | False | Indexed in composite |
| created_at | DateTime | No | CURRENT_TIMESTAMP | Server default |
| updated_at | DateTime | No | CURRENT_TIMESTAMP | Auto-update on modification |

**Indexes**:
- `idx_task_user_id` on `user_id`
- `idx_task_user_completed` on `(user_id, completed)`

### Conversation

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| id | Integer | No | Auto-increment | Primary key |
| user_id | String | No | — | Indexed |
| created_at | DateTime | No | CURRENT_TIMESTAMP | Server default |
| updated_at | DateTime | No | CURRENT_TIMESTAMP | Auto-update on modification |

**Indexes**:
- `idx_conversation_user_id` on `user_id`

### Message

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| id | Integer | No | Auto-increment | Primary key |
| user_id | String | No | — | Indexed |
| conversation_id | Integer | No | — | FK → Conversation.id |
| role | String | No | — | "user" or "assistant" |
| content | Text | No | — | Full message content |
| created_at | DateTime | No | CURRENT_TIMESTAMP | Server default |

**Indexes**:
- `idx_message_user_id` on `user_id`

## Validation Rules

- `Task.title`: 1–255 characters, non-empty
- `Task.description`: 0–1000 characters
- `Task.completed`: boolean only
- `Task.user_id`: non-empty string
- `Message.role`: must be one of "user", "assistant"
- `Message.content`: non-empty text
- `Message.conversation_id`: must reference existing Conversation
- All `user_id` fields: string type, never cast to integer

## Migration Strategy

- Use `SQLModel.metadata.create_all(engine)` on startup
- Idempotent: uses `CREATE TABLE IF NOT EXISTS`
- Preserves existing data across restarts
- No Alembic — see research.md Decision 2
