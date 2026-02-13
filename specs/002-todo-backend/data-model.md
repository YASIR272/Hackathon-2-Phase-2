# Data Model: Todo Application Backend

**Feature**: Todo Application Backend
**Date**: 2026-02-09

## Overview

This document defines the data model for the Todo application backend, including the Task entity and its relationships.

## Task Entity

The Task entity represents a user's todo item in the system.

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Integer | Yes | Unique identifier for the task (Primary Key) |
| title | String | Yes | Short descriptive name for the task (1-255 characters) |
| description | String | No | Detailed description of the task (0-1000 characters) |
| completed | Boolean | Yes | Whether the task has been completed (Default: false) |
| user_id | String | Yes | Identifier of the user who owns this task (Indexed) |
| created_at | DateTime | Yes | Timestamp when the task was created (Auto-set) |
| updated_at | DateTime | Yes | Timestamp when the task was last updated (Auto-set) |

### Indexes

1. **Primary Index**: `id` - Unique identifier for each task
2. **User Index**: `user_id` - Improves performance of user-specific queries
3. **Completion Index**: `completed` - Improves performance of status-based filtering
4. **Composite Index**: `(user_id, completed)` - Improves performance of combined user and status queries

### Constraints

- `title`: Must be between 1 and 255 characters
- `description`: Must be between 0 and 1000 characters
- `user_id`: Must be a non-empty string
- `completed`: Must be a boolean value

### Relationships

- Each task belongs to exactly one user (via user_id)
- Users can have zero or more tasks
- No direct relationship to other entities (users managed by external auth system)

## Database Considerations

### Connection URLs

- **Development**: `sqlite:///./todo.db` (local SQLite file)
- **Production**: `postgresql://neondb_owner:npg_vbGNx8Ppi1XL@ep-still-paper-a1jkrkvc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` (Neon PostgreSQL)

### Schema Definition (SQLModel)

```python
class Task(TaskBase, table=True):
    """Task model for database table"""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Indexes for efficient querying
    __table_args__ = (
        Index('idx_user_id', 'user_id'),
        Index('idx_completed', 'completed'),
        Index('idx_user_completed', 'user_id', 'completed'),
    )
```

### Data Persistence

Tasks must persist across application restarts with all attributes maintained including timestamps and completion status. The database schema will be automatically created when the application starts.