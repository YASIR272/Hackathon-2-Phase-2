# API Contracts: Premium Frontend for Todo Application

## Authentication Endpoints

### POST /api/auth/signup
Create a new user account

**Request**:
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }
  ```

**Response**:
- 200: User created successfully
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid-string",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  }
  ```
- 400: Validation error
  ```json
  {
    "success": false,
    "error": {
      "message": "Validation error details"
    }
  }
  ```
- 409: User already exists
  ```json
  {
    "success": false,
    "error": {
      "message": "User with this email already exists"
    }
  }
  ```

### POST /api/auth/signin
Authenticate an existing user

**Request**:
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```

**Response**:
- 200: Authentication successful
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid-string",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "token": "jwt-token-string"
    }
  }
  ```
- 401: Invalid credentials
  ```json
  {
    "success": false,
    "error": {
      "message": "Invalid email or password"
    }
  }
  ```

### POST /api/auth/signout
Log out the current user

**Request**:
- Headers: `Authorization: Bearer {token}`

**Response**:
- 200: Successfully signed out
  ```json
  {
    "success": true,
    "message": "Successfully signed out"
  }
  ```

## Task Management Endpoints

### GET /api/tasks
Retrieve all tasks for the authenticated user

**Request**:
- Headers: `Authorization: Bearer {token}`

**Response**:
- 200: Tasks retrieved successfully
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": 1,
          "title": "Sample task",
          "description": "Task description",
          "completed": false,
          "userId": "user-id",
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        }
      ]
    }
  }
  ```

### POST /api/tasks
Create a new task for the authenticated user

**Request**:
- Headers: `Authorization: Bearer {token}`, `Content-Type: application/json`
- Body:
  ```json
  {
    "title": "New task",
    "description": "Task description (optional)",
    "completed": false
  }
  ```

**Response**:
- 201: Task created successfully
  ```json
  {
    "success": true,
    "data": {
      "task": {
        "id": 1,
        "title": "New task",
        "description": "Task description (optional)",
        "completed": false,
        "userId": "user-id",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    }
  }
  ```

### PUT /api/tasks/{id}
Update an existing task

**Request**:
- Headers: `Authorization: Bearer {token}`, `Content-Type: application/json`
- Body:
  ```json
  {
    "title": "Updated task title",
    "description": "Updated description",
    "completed": true
  }
  ```

**Response**:
- 200: Task updated successfully
  ```json
  {
    "success": true,
    "data": {
      "task": {
        "id": 1,
        "title": "Updated task title",
        "description": "Updated description",
        "completed": true,
        "userId": "user-id",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-02T00:00:00Z"
      }
    }
  }
  ```
- 404: Task not found
  ```json
  {
    "success": false,
    "error": {
      "message": "Task not found"
    }
  }
  ```

### DELETE /api/tasks/{id}
Delete a task

**Request**:
- Headers: `Authorization: Bearer {token}`

**Response**:
- 200: Task deleted successfully
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```
- 404: Task not found
  ```json
  {
    "success": false,
    "error": {
      "message": "Task not found"
    }
  }
  ```

### PATCH /api/tasks/{id}/toggle-complete
Toggle the completion status of a task

**Request**:
- Headers: `Authorization: Bearer {token}`, `Content-Type: application/json`
- Body:
  ```json
  {
    "completed": true
  }
  ```

**Response**:
- 200: Task completion toggled successfully
  ```json
  {
    "success": true,
    "data": {
      "task": {
        "id": 1,
        "title": "Sample task",
        "description": "Task description",
        "completed": true,
        "userId": "user-id",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-02T00:00:00Z"
      }
    }
  }
  ```

## User Profile Endpoints

### GET /api/users/profile
Retrieve the authenticated user's profile

**Request**:
- Headers: `Authorization: Bearer {token}`

**Response**:
- 200: Profile retrieved successfully
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "John Doe",
        "themePreference": "system",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    }
  }
  ```

### PUT /api/users/profile
Update the authenticated user's profile

**Request**:
- Headers: `Authorization: Bearer {token}`, `Content-Type: application/json`
- Body:
  ```json
  {
    "name": "John Smith",
    "themePreference": "dark"
  }
  ```

**Response**:
- 200: Profile updated successfully
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "John Smith",
        "themePreference": "dark",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-02T00:00:00Z"
      }
    }
  }
  ```