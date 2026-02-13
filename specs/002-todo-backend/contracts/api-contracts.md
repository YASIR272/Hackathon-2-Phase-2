# API Contracts: Todo Application Backend

**Feature**: Todo Application Backend
**Date**: 2026-02-09

## Overview

This document defines the API contracts for the Todo application backend, specifying the endpoints, request/response formats, and error handling for all task management operations.

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

The token must contain a `userId` claim that will be used to enforce user isolation.

## Error Response Format

All error responses follow this standard format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Task Entity

### Task Object

```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "user_id": "user123",
  "created_at": "2026-02-09T10:00:00Z",
  "updated_at": "2026-02-09T10:00:00Z"
}
```

### Task List Response

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "user_id": "user123",
      "created_at": "2026-02-09T10:00:00Z",
      "updated_at": "2026-02-09T10:00:00Z"
    }
  ],
  "total_count": 10,
  "filtered_count": 1
}
```

## API Endpoints

### 1. Get Tasks

**Endpoint**: `GET /api/{user_id}/tasks`

**Query Parameters**:
- `status`: Filter by completion status ("all", "pending", "completed") - default: "all"
- `sort`: Sort field ("created", "updated", "title") - default: "created"
- `order`: Sort order ("asc", "desc") - default: "desc"

**Response**: 200 OK
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Sample Task",
      "description": "Task description",
      "completed": false,
      "user_id": "user123",
      "created_at": "2026-02-09T10:00:00Z",
      "updated_at": "2026-02-09T10:00:00Z"
    }
  ],
  "total_count": 5,
  "filtered_count": 1
}
```

**Errors**:
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: User ID mismatch

### 2. Create Task

**Endpoint**: `POST /api/{user_id}/tasks`

**Request Body**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "completed": false
}
```

**Response**: 201 Created
```json
{
  "id": 2,
  "title": "New Task",
  "description": "Task description",
  "completed": false,
  "user_id": "user123",
  "created_at": "2026-02-09T11:00:00Z",
  "updated_at": "2026-02-09T11:00:00Z"
}
```

**Errors**:
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: User ID mismatch
- 422 Unprocessable Entity: Validation errors

### 3. Get Task by ID

**Endpoint**: `GET /api/{user_id}/tasks/{id}`

**Response**: 200 OK
```json
{
  "id": 1,
  "title": "Sample Task",
  "description": "Task description",
  "completed": false,
  "user_id": "user123",
  "created_at": "2026-02-09T10:00:00Z",
  "updated_at": "2026-02-09T10:00:00Z"
}
```

**Errors**:
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: User ID mismatch
- 404 Not Found: Task not found

### 4. Update Task

**Endpoint**: `PUT /api/{user_id}/tasks/{id}`

**Request Body**:
```json
{
  "title": "Updated Task Title",
  "description": "Updated task description",
  "completed": true
}
```

**Response**: 200 OK
```json
{
  "id": 1,
  "title": "Updated Task Title",
  "description": "Updated task description",
  "completed": true,
  "user_id": "user123",
  "created_at": "2026-02-09T10:00:00Z",
  "updated_at": "2026-02-09T12:00:00Z"
}
```

**Errors**:
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: User ID mismatch
- 404 Not Found: Task not found
- 422 Unprocessable Entity: Validation errors

### 5. Delete Task

**Endpoint**: `DELETE /api/{user_id}/tasks/{id}`

**Response**: 204 No Content

**Errors**:
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: User ID mismatch
- 404 Not Found: Task not found

### 6. Toggle Task Completion

**Endpoint**: `PATCH /api/{user_id}/tasks/{id}/complete`

**Request Body**:
```json
{
  "completed": true
}
```

**Response**: 200 OK
```json
{
  "id": 1,
  "completed": true,
  "updated_at": "2026-02-09T12:00:00Z"
}
```

**Errors**:
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: User ID mismatch
- 404 Not Found: Task not found