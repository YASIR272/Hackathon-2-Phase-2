# Todo Backend API

Secure, scalable backend API for the Todo application with JWT-based authentication and user isolation.

## Features

- Full CRUD operations for tasks
- JWT authentication with user isolation
- Filtering and sorting of tasks
- Proper error handling with standardized responses
- CORS support for frontend integration
- PostgreSQL (production) and SQLite (development) support
- Automatic timestamp management for created_at and updated_at fields
- Efficient database indexing for optimal performance

## Prerequisites

- Python 3.9+
- pip package manager

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```env
   BETTER_AUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH
   DATABASE_URL=sqlite:///./todo.db
   NEON_DB_URL=postgresql://neondb_owner:npg_vbGNx8Ppi1XL@ep-still-paper-a1jkrkvc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   FRONTEND_ORIGIN=http://localhost:3000
   ```

## Running the Application

```bash
# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Run the application
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### Authentication

All endpoints require JWT authentication in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

The JWT token should contain a `userId` or `sub` claim that identifies the user.

### Task Management Endpoints

#### GET /api/{user_id}/tasks - Retrieve user's tasks

Retrieve all tasks for a user with optional filtering and sorting.

**Query Parameters:**
- `status`: Filter by completion status (`all`, `pending`, `completed`) - default: `all`
- `sort`: Sort by field (`created`, `updated`, `title`) - default: `created`
- `order`: Sort order (`asc`, `desc`) - default: `desc`
- `limit`: Limit number of results (1-100) - default: no limit
- `offset`: Offset for pagination - default: 0

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:8000/api/user123/tasks?status=pending&sort=title&order=asc"
```

**Example Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, bread, eggs",
      "completed": false,
      "user_id": "user123",
      "created_at": "2026-02-10T10:00:00",
      "updated_at": "2026-02-10T10:00:00"
    }
  ],
  "total_count": 5,
  "filtered_count": 3
}
```

#### POST /api/{user_id}/tasks - Create new task

Create a new task for a user.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description (optional)",
  "completed": false (optional, default: false)
}
```

**Example Request:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Buy groceries","description":"Milk, bread, eggs"}' \
     http://localhost:8000/api/user123/tasks
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "user_id": "user123",
  "created_at": "2026-02-10T10:00:00",
  "updated_at": "2026-02-10T10:00:00"
}
```

#### GET /api/{user_id}/tasks/{id} - Get specific task

Retrieve a specific task by ID.

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user123/tasks/1
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "user_id": "user123",
  "created_at": "2026-02-10T10:00:00",
  "updated_at": "2026-02-10T10:00:00"
}
```

#### PUT /api/{user_id}/tasks/{id} - Update specific task

Update a specific task.

**Request Body:**
```json
{
  "title": "Updated task title (optional)",
  "description": "Updated task description (optional)",
  "completed": true (optional)
}
```

**Example Request:**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Buy groceries and vegetables","completed":true}' \
     http://localhost:8000/api/user123/tasks/1
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Buy groceries and vegetables",
  "description": "Milk, bread, eggs",
  "completed": true,
  "user_id": "user123",
  "created_at": "2026-02-10T10:00:00",
  "updated_at": "2026-02-10T11:00:00"
}
```

#### DELETE /api/{user_id}/tasks/{id} - Delete specific task

Delete a specific task.

**Example Request:**
```bash
curl -X DELETE \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user123/tasks/1
```

**Response:**
Returns HTTP 204 No Content on successful deletion.

#### PATCH /api/{user_id}/tasks/{id}/complete - Toggle task completion

Toggle the completion status of a task.

**Request Body:**
```json
{
  "completed": true
}
```

**Example Request:**
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"completed":true}' \
     http://localhost:8000/api/user123/tasks/1/complete
```

**Example Response:**
```json
{
  "id": 1,
  "completed": true,
  "updated_at": "2026-02-10T11:00:00"
}
```

## Error Responses

The API returns standardized error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Missing or invalid authentication token
- 403 Forbidden: Access denied to another user's resources
- 404 Not Found: Resource not found
- 422 Unprocessable Entity: Validation error
- 500 Internal Server Error: Server error

## Environment Variables

- `BETTER_AUTH_SECRET`: Secret key for JWT token verification
- `DATABASE_URL`: Database connection string (SQLite for dev, PostgreSQL for prod)
- `NEON_DB_URL`: Production database URL (Neon PostgreSQL) - optional
- `FRONTEND_ORIGIN`: Origin for CORS (defaults to http://localhost:3000)

## Database Schema

The application uses SQLModel to define the database schema:

- **Tasks Table**:
  - `id`: Integer, Primary Key
  - `title`: String (1-255 chars), Required
  - `description`: String (max 1000 chars), Optional
  - `completed`: Boolean, Default: false, Indexed for efficient queries
  - `user_id`: String, Indexed for efficient queries
  - `created_at`: DateTime, Auto-generated
  - `updated_at`: DateTime, Auto-generated and updated on changes

Indexes:
- Individual index on `user_id` for efficient user-based queries
- Individual index on `completed` for efficient status filtering  
- Composite index on `(user_id, completed)` for efficient combined queries

## Testing

To test the API endpoints:

1. Start the application:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

2. Use curl, Postman, or the integrated FastAPI documentation at `http://localhost:8000/docs` to make requests with a valid JWT token.

3. Example test with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:8000/api/user123/tasks
   ```

## Performance

All endpoints are designed to respond in under 500ms under normal conditions. The API uses efficient database queries with proper indexing on user_id and completion status fields. The updated_at field is automatically managed by the database using triggers for optimal performance.

## Development

For development, the application uses:
- FastAPI for the web framework
- SQLModel for database modeling
- Pydantic for data validation
- PyJWT for authentication
- Uvicorn as the ASGI server

To run tests, execute:
```bash
python test_backend.py
```