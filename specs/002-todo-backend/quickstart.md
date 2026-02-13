# Quick Start Guide: Todo Application Backend

**Feature**: Todo Application Backend
**Date**: 2026-02-09

## Overview

This guide provides instructions for setting up and running the Todo application backend locally for development and testing.

## Prerequisites

- Python 3.9 or higher
- pip package manager
- Virtual environment tool (venv or virtualenv)
- Git (for version control)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone [repository-url]
cd [repository-directory]/backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
BETTER_AUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH
DATABASE_URL=sqlite:///./todo.db
NEON_DB_URL=postgresql://neondb_owner:npg_vbGNx8Ppi1XL@ep-still-paper-a1jkrkvc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
FRONTEND_ORIGIN=http://localhost:3000
```

### 5. Run the Application

```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Task Endpoints

1. **Get Tasks**: `GET /api/{user_id}/tasks`
   - Query Parameters:
     - `status`: "all", "pending", or "completed" (default: "all")
     - `sort`: "created", "updated", or "title" (default: "created")
     - `order`: "asc" or "desc" (default: "desc")

2. **Create Task**: `POST /api/{user_id}/tasks`
   - Request Body: `{ "title": "Task title", "description": "Task description", "completed": false }`

3. **Get Specific Task**: `GET /api/{user_id}/tasks/{id}`

4. **Update Task**: `PUT /api/{user_id}/tasks/{id}`
   - Request Body: `{ "title": "Updated title", "description": "Updated description", "completed": true }`

5. **Delete Task**: `DELETE /api/{user_id}/tasks/{id}`

6. **Toggle Completion**: `PATCH /api/{user_id}/tasks/{id}/complete`
   - Request Body: `{ "completed": true }`

## Testing the API

You can test the API using curl or Postman:

### Example curl Commands

1. **Get Tasks**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/user123/tasks
```

2. **Create Task**:
```bash
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" -H "Content-Type: application/json" -d '{"title":"Test Task","description":"Test Description"}' http://localhost:8000/api/user123/tasks
```

3. **Update Task**:
```bash
curl -X PUT -H "Authorization: Bearer YOUR_JWT_TOKEN" -H "Content-Type: application/json" -d '{"title":"Updated Task","completed":true}' http://localhost:8000/api/user123/tasks/1
```

## Development Workflow

### Making Changes

1. Ensure virtual environment is activated
2. Make code changes
3. Restart the development server (it auto-reloads with --reload flag)
4. Test changes with curl or Postman

### Adding Dependencies

```bash
pip install new-package
pip freeze > requirements.txt
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure virtual environment is activated and dependencies are installed
2. **Database Connection Issues**: Check DATABASE_URL in .env file
3. **Authentication Failures**: Verify BETTER_AUTH_SECRET matches frontend
4. **CORS Errors**: Check FRONTEND_ORIGIN matches frontend URL

### Logs

Check the terminal where the application is running for error messages and debug information.

## Next Steps

1. Review the full API documentation at `http://localhost:8000/docs` when the server is running
2. Refer to the detailed specification in `specs/002-todo-backend/spec.md`
3. Check the implementation plan in `specs/002-todo-backend/plan.md`