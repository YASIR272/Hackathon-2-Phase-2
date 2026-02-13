# Implementation Plan: Todo Application Backend

**Branch**: `002-todo-backend` | **Date**: 2026-02-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-todo-backend/spec.md`

**Note**: This plan implements a FastAPI backend for a Todo application with JWT authentication, SQLModel ORM, and full CRUD operations for tasks.

## Summary

This implementation plan outlines the development of a FastAPI backend for a Todo application that provides secure, multi-user task management with JWT authentication, PostgreSQL/SQLite database integration, and RESTful API endpoints. The backend will enforce user isolation, provide filtering and sorting capabilities, and seamlessly integrate with the existing frontend through proper CORS configuration and JSON response formats.

## Technical Context

**Language/Version**: Python 3.9+
**Primary Dependencies**: FastAPI, SQLModel, PyJWT, Pydantic, python-dotenv, uvicorn
**Storage**: PostgreSQL (production) with SQLite fallback (development)
**Testing**: Manual testing with curl/Postman
**Target Platform**: Linux server (containerized deployment)
**Project Type**: Web application backend
**Performance Goals**: <500ms response times for all operations
**Constraints**: Stateless JWT authentication, user isolation, CORS for localhost:3000
**Scale/Scope**: Multi-user application with task management features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on the constitution template, this implementation adheres to the following principles:

1. **Library-First Approach**: Modular design with clear separation of concerns (models, services, routes)
2. **CLI Interface**: Standard Python package structure with clear entry points
3. **Test-First**: Manual testing approach documented for all endpoints
4. **Integration Testing**: Focus on API endpoint testing and frontend integration
5. **Observability**: Logging for authentication failures and error tracking
6. **Simplicity**: Minimal dependencies and straightforward implementation

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-backend/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── api-contracts.md # OpenAPI schema definitions
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── main.py              # Application entry point and startup configuration
├── config.py            # Environment configuration and settings management
├── database.py          # Database connection and session management
├── models.py            # SQLModel data models and table definitions
├── schemas.py           # Pydantic schemas for request/response validation
├── auth.py              # Authentication and authorization utilities
├── crud.py              # Create, Read, Update, Delete operations for tasks
├── routes/
│   └── tasks.py         # Task-related API endpoints and route handlers
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not committed)
└── README.md            # Project documentation and setup instructions
```

**Structure Decision**: Web application structure with clear separation between backend API and frontend UI. Backend follows modular design with dedicated files for each concern.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations of constitutional principles. The implementation follows standard practices for FastAPI applications with appropriate separation of concerns.

## Overall Architecture Sketch

### Folder Structure Details

The backend follows a modular structure with clear separation of concerns:

- `main.py`: Entry point that initializes the FastAPI application, configures middleware, and registers routes
- `config.py`: Loads environment variables and provides centralized configuration access
- `database.py`: Manages database connections and session lifecycle
- `models.py`: Defines SQLModel classes for database entities with proper indexing
- `schemas.py`: Contains Pydantic models for request/response validation and serialization
- `auth.py`: Implements JWT verification and user identity extraction
- `crud.py`: Provides database operations with user isolation enforcement
- `routes/tasks.py`: Implements all RESTful endpoints for task management
- `requirements.txt`: Lists all Python dependencies
- `.env`: Stores environment variables (not committed to version control)

### Main Technology Decisions

1. **FastAPI**: Modern, fast web framework with automatic API documentation
2. **SQLModel**: ORM that integrates seamlessly with FastAPI and Pydantic
3. **PyJWT**: Lightweight library for JWT token verification
4. **python-dotenv**: Simplifies environment variable management
5. **uvicorn**: ASGI server for running the application
6. **SQLite/PostgreSQL**: Flexible database options for development and production

### High-Level Flow Overview

1. **Request**: Client sends HTTP request to API endpoint
2. **Middleware**: CORS middleware handles cross-origin requests
3. **Authentication**: JWT middleware verifies token and extracts user_id
4. **Route Handler**: Endpoint function processes request with validated user context
5. **Database Query**: CRUD operations filter data by user_id for isolation
6. **Response**: JSON response returned with appropriate HTTP status codes

## Phased Implementation Roadmap

### Phase 1: Project Setup & Environment Configuration

**Goal**: Establish development environment with proper configuration management

1. Create project directory structure with all required files
2. Set up virtual environment and activate it
3. Install dependencies from requirements.txt (FastAPI, SQLModel, PyJWT, etc.)
4. Create .env file with environment variables (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
5. Implement configuration management with pydantic-settings
6. Create README.md with setup and usage instructions

**Dependencies**: None (foundational phase)

**Key Files to Create/Modify**:
- backend/requirements.txt
- backend/.env
- backend/config.py
- backend/README.md

**Acceptance Criteria**:
- Virtual environment activates successfully
- All dependencies install without errors
- Environment variables load correctly
- Configuration settings accessible via config.py

**Security & Integration Notes**:
- BETTER_AUTH_SECRET stored only in environment variables
- DATABASE_URL supports both SQLite (dev) and PostgreSQL (prod)
- No hardcoded credentials in source code

### Phase 2: Database Connection & Schema Initialization

**Goal**: Implement database connectivity and Task model with proper indexing

1. Create database connection management in database.py
2. Define Task SQLModel class with all required fields (id, title, description, completed, user_id, timestamps)
3. Implement proper indexing for user_id and completed fields
4. Set up automatic timestamp fields (created_at, updated_at)
5. Create database initialization code in main.py
6. Test database connectivity and table creation with both SQLite and PostgreSQL

**Dependencies**: Phase 1 (environment configuration must be complete)

**Key Files to Create/Modify**:
- backend/database.py
- backend/models.py

**Acceptance Criteria**:
- Task model correctly defines all required fields
- Database tables create successfully with proper indexes
- Timestamps populate automatically
- Database sessions can be created and managed
- Both SQLite and PostgreSQL connections work

**Security & Integration Notes**:
- SSL connections for PostgreSQL in production
- Proper indexing for efficient user-specific queries
- Automatic timestamps prevent tampering

### Phase 3: JWT Authentication Middleware & User Extraction

**Goal**: Implement secure JWT verification and user identity extraction

1. Create JWT token verification utility in auth.py
2. Implement middleware to extract user_id from Authorization header
3. Create dependency for getting current user ID in route handlers
4. Implement authorization checks for user isolation
5. Add error handling for authentication failures (401, 403)
6. Test authentication with valid, invalid, and expired tokens

**Dependencies**: Phase 1 (configuration must support BETTER_AUTH_SECRET)

**Key Files to Create/Modify**:
- backend/auth.py

**Acceptance Criteria**:
- Valid JWT tokens are correctly verified
- User ID is successfully extracted from tokens
- Invalid tokens are rejected with 401 Unauthorized
- Expired tokens are rejected with 401 Unauthorized
- User isolation is enforced on all operations

**Security & Integration Notes**:
- JWT secret stored securely in environment variables
- Proper error handling without revealing sensitive information
- Logging for authentication failures for security monitoring

### Phase 4: Core API Routes Setup

**Goal**: Establish the foundational API structure and route registration

1. Create router for task endpoints in routes/tasks.py
2. Implement basic route handlers that return placeholder responses
3. Register routes in main.py with appropriate prefixes
4. Set up global exception handlers for common error cases
5. Configure CORS middleware for frontend integration
6. Test route registration and basic endpoint accessibility

**Dependencies**: Phase 1-3 (authentication, database, and configuration must be available)

**Key Files to Create/Modify**:
- backend/routes/tasks.py
- backend/main.py

**Acceptance Criteria**:
- All route endpoints are registered and accessible
- CORS is properly configured for localhost:3000
- Global exception handlers catch common errors
- Authentication middleware integrated with routes

**Security & Integration Notes**:
- CORS configured only for trusted frontend origins
- Authentication required for all endpoints
- Proper HTTP status codes returned for different scenarios

### Phase 5: Implement GET /api/{user_id}/tasks (list with filters/sorts)

**Goal**: Implement task listing with filtering and sorting capabilities

1. Create Pydantic schemas for request parameters and response formats
2. Implement get_tasks function in crud.py with filtering by status
3. Add sorting capabilities (created, updated, title)
4. Implement pagination support if needed
5. Create route handler in routes/tasks.py with query parameter validation
6. Test endpoint with various filter and sort combinations

**Dependencies**: Phase 4 (route infrastructure must be in place)

**Key Files to Create/Modify**:
- backend/schemas.py
- backend/crud.py
- backend/routes/tasks.py

**Acceptance Criteria**:
- Tasks returned are filtered by authenticated user_id
- Filtering by status (all, pending, completed) works correctly
- Sorting by creation date, update date, and title functions properly
- Empty task lists handled gracefully
- Proper HTTP status codes returned

**Security & Integration Notes**:
- User isolation enforced at database query level
- Input validation prevents injection attacks
- Response formats match frontend expectations

### Phase 6: Implement POST /api/{user_id}/tasks (create task)

**Goal**: Enable users to create new tasks with proper validation

1. Implement create_task function in crud.py
2. Add input validation for task fields (title length, description length)
3. Implement automatic timestamp setting on creation
4. Create route handler with request body validation
5. Return created task with 201 Created status
6. Test with valid and invalid input data

**Dependencies**: Phase 4-5 (route infrastructure and schemas must be available)

**Key Files to Create/Modify**:
- backend/crud.py
- backend/routes/tasks.py

**Acceptance Criteria**:
- New tasks are associated with the authenticated user_id
- Input validation prevents invalid data from being stored
- Automatic timestamps are set on creation
- 201 Created status returned with task data
- Proper error responses for validation failures

**Security & Integration Notes**:
- User isolation enforced on task creation
- Input sanitization prevents XSS and injection attacks
- Response format consistent with other endpoints

### Phase 7: Implement GET/PUT/DELETE /api/{user_id}/tasks/{id} (details, update, delete)

**Goal**: Complete core CRUD operations for individual tasks

1. Implement get_task_by_id function in crud.py
2. Implement update_task function with partial update support
3. Implement delete_task function with proper cleanup
4. Add ownership verification to prevent cross-user access
5. Create route handlers with ID validation and error handling
6. Test all operations with valid and invalid scenarios

**Dependencies**: Phase 4-6 (previous endpoint implementations)

**Key Files to Create/Modify**:
- backend/crud.py
- backend/routes/tasks.py

**Acceptance Criteria**:
- Users can only access their own tasks
- Task details returned with complete information
- Partial updates work correctly (only provided fields updated)
- Deletion removes tasks permanently
- Proper error responses for not found and unauthorized access

**Security & Integration Notes**:
- Ownership verification at both route and database levels
- Input validation prevents unauthorized data modification
- Proper HTTP status codes for all scenarios

### Phase 8: Implement PATCH /api/{user_id}/tasks/{id}/complete (toggle complete)

**Goal**: Provide specialized endpoint for task completion toggling

1. Create Pydantic schema for completion status updates
2. Implement toggle_task_completion function in crud.py
3. Add automatic timestamp update on completion toggle
4. Create route handler with validation and error handling
5. Test completion toggling with various scenarios
6. Verify integration with filtering by completion status

**Dependencies**: Phase 4-7 (core CRUD operations must be complete)

**Key Files to Create/Modify**:
- backend/schemas.py
- backend/crud.py
- backend/routes/tasks.py

**Acceptance Criteria**:
- Completion status toggles correctly between true/false
- Updated timestamp reflects when completion status changed
- Only task owners can toggle completion status
- Proper HTTP status codes and response formats
- Integration with filtering by completion status works

**Security & Integration Notes**:
- Same ownership verification as other task operations
- Consistent response format with other endpoints
- Automatic timestamp prevents completion time manipulation

### Phase 9: Error Handling, CORS, Logging & Final Testing/Integration

**Goal**: Ensure robust error handling, proper logging, and complete integration

1. Implement comprehensive error handling for edge cases
2. Add detailed logging for debugging and monitoring
3. Finalize CORS configuration for production environments
4. Perform end-to-end testing with curl/Postman
5. Verify integration with frontend authentication flow
6. Document API endpoints with examples and error cases

**Dependencies**: Phase 1-8 (all core functionality must be implemented)

**Key Files to Create/Modify**:
- backend/main.py
- backend/auth.py
- backend/routes/tasks.py
- backend/README.md

**Acceptance Criteria**:
- All error scenarios handled with appropriate HTTP status codes
- Authentication failures logged for security monitoring
- CORS properly configured for frontend origins
- All endpoints function correctly with manual testing
- Frontend can successfully integrate with backend APIs
- Documentation is clear and complete

**Security & Integration Notes**:
- Comprehensive logging for security events
- No sensitive information leaked in error responses
- CORS restricted to trusted origins only
- SSL termination handled at infrastructure level

## Important Decisions & Tradeoffs

### ORM: SQLModel vs SQLAlchemy

**Decision**: SQLModel
**Rationale**: SQLModel provides seamless integration with FastAPI and Pydantic, offering type safety and automatic API documentation generation. It's simpler to use than raw SQLAlchemy while still providing powerful ORM capabilities.
**Alternatives Considered**: Raw SQLAlchemy (more verbose), Tortoise ORM (less mature), Peewee (not FastAPI-optimized)

### JWT Library: pyjwt vs fastapi-jwt-auth

**Decision**: pyjwt
**Rationale**: PyJWT is lightweight, well-maintained, and provides exactly what we need for JWT verification without unnecessary overhead. It's the de facto standard for JWT handling in Python.
**Alternatives Considered**: fastapi-jwt-auth (adds complexity), Authlib (overkill for simple JWT verification), custom implementation (security risk)

### Env Management: python-dotenv vs os.environ

**Decision**: python-dotenv
**Rationale**: python-dotenv provides convenient .env file support for local development while still allowing environment variables to be overridden in production environments.
**Alternatives Considered**: Direct os.environ (no file support), environs (adds complexity), custom solution (unnecessary)

### Database URL Handling: Switch between local SQLite and Neon Postgres

**Decision**: Environment variable with fallback
**Rationale**: Using DATABASE_URL with a fallback to SQLite provides flexibility for different environments while maintaining simplicity. Production uses Neon PostgreSQL URL directly.
**Alternatives Considered**: Separate environment variables (more complex), configuration-based switching (overhead), fixed database choice (inflexible)

### Error Responses: Custom models vs HTTPException

**Decision**: HTTPException
**Rationale**: FastAPI's HTTPException provides standard error handling that integrates well with automatic API documentation and follows REST conventions.
**Alternatives Considered**: Custom error models (inconsistent), returning error dictionaries (no HTTP status codes), exception middleware (adds complexity)

### Filtering/Sorting: Custom query params vs libraries

**Decision**: Custom implementation
**Rationale**: Custom query parameter handling provides full control over filtering and sorting behavior while keeping dependencies minimal. The requirements are straightforward enough that a library would be overkill.
**Alternatives Considered**: SQLAlchemy filters (adds complexity), third-party libraries (unnecessary dependencies), database views (inflexible)

### CORS: fastapi.middleware.cors

**Decision**: FastAPI CORS middleware
**Rationale**: Built-in middleware provides reliable CORS handling with minimal configuration. It's well-tested and integrates seamlessly with FastAPI.
**Alternatives Considered**: Custom middleware (reinventing the wheel), nginx configuration (infrastructure-level), third-party libraries (unnecessary)

### Logging: logging module vs structlog

**Decision**: Python logging module
**Rationale**: Standard library logging provides sufficient functionality for our needs without adding dependencies. It's familiar to most Python developers and configurable enough for our requirements.
**Alternatives Considered**: structlog (adds dependency), loguru (unnecessary features), custom solution (maintenance burden)

## Testing & Validation Strategy

### Manual Testing Checklist

For each endpoint, test the following scenarios:

1. **Valid Authentication**:
   ```bash
   curl -H "Authorization: Bearer VALID_JWT_TOKEN" http://localhost:8000/api/user123/tasks
   ```

2. **Missing Authentication**:
   ```bash
   curl http://localhost:8000/api/user123/tasks
   # Expected: 401 Unauthorized
   ```

3. **Invalid Authentication**:
   ```bash
   curl -H "Authorization: Bearer INVALID_TOKEN" http://localhost:8000/api/user123/tasks
   # Expected: 401 Unauthorized
   ```

4. **Cross-User Access**:
   ```bash
   curl -H "Authorization: Bearer USER1_TOKEN" http://localhost:8000/api/user456/tasks
   # Expected: 403 Forbidden
   ```

5. **Valid Operations**:
   ```bash
   curl -X POST -H "Authorization: Bearer VALID_TOKEN" -H "Content-Type: application/json" \
   -d '{"title":"Test Task","description":"Test Description"}' \
   http://localhost:8000/api/user123/tasks
   ```

6. **Invalid Input**:
   ```bash
   curl -X POST -H "Authorization: Bearer VALID_TOKEN" -H "Content-Type: application/json" \
   -d '{"title":""}' http://localhost:8000/api/user123/tasks
   # Expected: 422 Unprocessable Entity
   ```

### API Testing Approach

1. **Endpoint Coverage**: Test all six required endpoints (GET list, POST create, GET details, PUT update, DELETE delete, PATCH toggle)
2. **Authentication Testing**: Verify JWT validation and user isolation for all endpoints
3. **Filtering/Sorting Testing**: Test all combinations of status filters and sorting options
4. **Edge Case Testing**: Test with empty lists, invalid IDs, missing fields, etc.
5. **Error Case Testing**: Verify appropriate error responses for all invalid scenarios

### Integration Testing

1. **Frontend Connection**: Verify frontend can obtain JWT tokens and make successful API calls
2. **Response Format Matching**: Ensure all JSON responses match frontend expectations
3. **CORS Validation**: Test that frontend requests are properly accepted
4. **End-to-End Flow**: Test complete user journey from authentication to task management

### Security Checks

1. **Authentication Enforcement**: Verify all endpoints require valid JWT tokens
2. **User Isolation**: Confirm users cannot access other users' tasks
3. **Input Validation**: Ensure malicious input is properly rejected
4. **Error Information Leakage**: Verify error responses don't reveal sensitive information
5. **Token Expiration**: Test that expired tokens are properly rejected

### Cross-Reference with Specifications

Validate against acceptance criteria from the feature specification:

- **SC-001**: Response times under 500ms (manual timing during testing)
- **SC-002**: JWT authentication accuracy (test with valid/invalid/expired tokens)
- **SC-003**: User isolation enforcement (cross-user access testing)
- **SC-004**: All six endpoints functional (comprehensive endpoint testing)
- **SC-005**: Database persistence (restart application and verify data retained)
- **SC-006**: Frontend integration (collaborate with frontend team for testing)

## Technical Guidelines Recap

### Route Structure

All routes are under `/api/` prefix as specified, with user-specific paths:
- `GET /api/{user_id}/tasks` - Retrieve user's tasks with filtering/sorting
- `POST /api/{user_id}/tasks` - Create new task for user
- `GET /api/{user_id}/tasks/{id}` - Get specific task
- `PUT /api/{user_id}/tasks/{id}` - Update specific task
- `DELETE /api/{user_id}/tasks/{id}` - Delete specific task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle task completion

### Data Models

Use Pydantic/SQLModel for all request/response models:
- Request validation with Pydantic schemas
- Database models with SQLModel classes
- Automatic serialization/deserialization

### Error Handling

Handle errors with HTTPException for standard REST responses:
- 401 Unauthorized for invalid/missing authentication
- 403 Forbidden for cross-user access attempts
- 404 Not Found for non-existent tasks
- 400 Bad Request for validation errors
- 422 Unprocessable Entity for request body validation failures

### Database Integration

SQLModel sessions with connection from DATABASE_URL environment variable:
- SQLite for local development (`file:./db.sqlite`)
- PostgreSQL for production (Neon URL with SSL)
- Automatic connection management through database.py

### Authentication Process

Extract token from Authorization header, verify with BETTER_AUTH_SECRET, get user_id:
- Bearer token format required in Authorization header
- Shared secret verification with PyJWT
- User ID extracted from token payload for query filtering

### Application Runtime

Running with uvicorn main:app --reload --port 8000:
- Auto-reload for development convenience
- Port 8000 for consistency with frontend expectations
- ASGI server for high performance

### Stateless Authentication

No shared DB sessions for auth – stateless JWT:
- Token-based authentication only
- No server-side session storage
- User context extracted from JWT on each request

## Final Deliverables Checklist

### Required Files

At the end of implementation, these files should exist:

1. `backend/main.py` - Application entry point with route registration
2. `backend/models.py` - SQLModel Task class with proper indexing
3. `backend/routes/tasks.py` - All task-related API endpoints
4. `backend/auth.py` - JWT verification and user extraction utilities
5. `backend/db.py` - Database connection and session management
6. `backend/schemas.py` - Pydantic models for request/response validation
7. `backend/config.py` - Environment configuration management
8. `backend/requirements.txt` - Python dependencies
9. `backend/.env.example` - Template for environment variables
10. `backend/README.md` - Setup and usage documentation

### Security Expectations

Final implementation should provide:

- **Strong Authentication**: JWT verification with shared secret
- **User Isolation**: Complete data separation between users
- **Input Validation**: Prevention of injection and XSS attacks
- **Error Handling**: No sensitive information leakage
- **Logging**: Authentication failures tracked for security monitoring
- **Secure Storage**: No hardcoded secrets, all in environment variables

### Performance Expectations

- **Response Times**: All operations under 500ms
- **Database Efficiency**: Proper indexing for user_id and completed fields
- **Memory Usage**: Minimal footprint suitable for containerized deployment
- **Concurrency**: Handle multiple simultaneous users without degradation

### Integration Readiness

Backend ready for frontend integration with:

- **Correct Status Codes**: 200, 201, 204, 400, 401, 403, 404 as appropriate
- **JSON Response Shapes**: Consistent format matching frontend expectations
- **CORS Enabled**: Proper configuration for localhost:3000 and production origins
- **Authentication Flow**: Compatible with Better Auth token system
- **Error Responses**: Helpful messages for debugging integration issues