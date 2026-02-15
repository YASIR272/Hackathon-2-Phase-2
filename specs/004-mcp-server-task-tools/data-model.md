# Data Model: MCP Server and All Task Tools

**Feature**: 004-mcp-server-task-tools
**Date**: 2026-02-14

## Entities

### Task (EXISTING — from Spec 1)

This spec does NOT create new entities. It operates on the existing Task model
defined in `backend/models.py` (Spec 1: 003-core-backend-auth).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | integer | auto | Primary key, auto-incremented |
| user_id | string | yes | Owner identifier, indexed |
| title | string | yes | 1–255 characters |
| description | string | no | 0–1000 characters |
| completed | boolean | yes | Default: false, indexed |
| priority | string | yes | Default: "normal" (not exposed by MCP tools in this spec) |
| due_date | datetime | no | Optional (not exposed by MCP tools in this spec) |
| created_at | datetime | auto | Set on creation |
| updated_at | datetime | auto | Set on modification |

**Indexes** (existing):
- `user_id` (single column)
- `completed` (single column)
- `idx_user_completed` (composite: user_id + completed)

### MCP Tool Parameter Schemas

These are the input/output contracts for each MCP tool. They are NOT database
entities — they define the JSON interface between the agent and the MCP server.

#### add_task

**Input**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | yes | Authenticated user's ID |
| title | string | yes | Task title (1–255 chars) |
| description | string | no | Optional task details |

**Output**:
```json
{"task_id": 5, "status": "created", "title": "Buy groceries"}
```

#### list_tasks

**Input**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | yes | Authenticated user's ID |
| status | string | no | Filter: "all" (default), "pending", "completed" |

**Output**:
```json
[{"id": 1, "title": "Buy groceries", "completed": false}, ...]
```

#### complete_task

**Input**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | yes | Authenticated user's ID |
| task_id | integer | yes | ID of task to complete |

**Output**:
```json
{"task_id": 3, "status": "completed", "title": "Call mom"}
```

#### delete_task

**Input**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | yes | Authenticated user's ID |
| task_id | integer | yes | ID of task to delete |

**Output**:
```json
{"task_id": 2, "status": "deleted", "title": "Old task"}
```

#### update_task

**Input**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | yes | Authenticated user's ID |
| task_id | integer | yes | ID of task to update |
| title | string | no | New title (if changing) |
| description | string | no | New description (if changing) |

**Output**:
```json
{"task_id": 1, "status": "updated", "title": "Buy groceries and fruits"}
```

#### Error Response (all tools)

```json
{"error": "Task not found"}
```

Possible error messages:
- `"Task not found"` — task_id does not exist or does not belong to user
- `"Title is required"` — add_task called without title
- `"No fields to update"` — update_task called with neither title nor description
- `"Invalid status filter"` — list_tasks called with unrecognized status value

## State Transitions

```
[Task Created] --> completed=false (pending)
                        |
           complete_task |
                        v
                   completed=true (completed)
                        |
           delete_task   | delete_task
                        v
                   [Task Deleted] (removed from DB)
```

Notes:
- Tasks can be deleted regardless of completion status
- Tasks can be updated regardless of completion status
- There is no "uncomplete" operation in this spec (complete_task only sets to true)
