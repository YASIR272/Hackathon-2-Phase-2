# Research: Todo Application Backend

**Feature**: Todo Application Backend
**Date**: 2026-02-09

## Technical Research

### FastAPI Framework

FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.

**Advantages**:
- High performance, comparable to NodeJS and Go
- Automatic interactive API documentation (Swagger UI and ReDoc)
- Easy to learn and use with minimal boilerplate
- Strong typing with Pydantic validation
- Built-in support for asynchronous programming

**Considerations**:
- Requires Python 3.7+ (we're using 3.9+ which is fine)
- Smaller community compared to Django/Flask but rapidly growing
- Good ecosystem with many compatible libraries

### SQLModel ORM

SQLModel is a library created by the same author as FastAPI, designed to simplify interacting with databases using SQLAlchemy and Pydantic.

**Advantages**:
- Built specifically for FastAPI applications
- Combines SQLAlchemy's power with Pydantic's data validation
- Automatic API documentation integration
- Simple and intuitive API
- Type-safe database operations

**Considerations**:
- Relatively new library (but stable)
- Limited to SQL databases (which fits our requirements)
- Smaller community than SQLAlchemy alone

### JWT Authentication

JSON Web Tokens (JWT) provide a stateless authentication mechanism suitable for REST APIs.

**Implementation Approach**:
- Verify JWT tokens using shared secret (BETTER_AUTH_SECRET)
- Extract user_id from token payload
- Enforce user isolation by filtering database queries by user_id
- Return appropriate HTTP status codes for authentication failures (401, 403)

**Security Considerations**:
- Store secret securely in environment variables
- Validate token expiration
- Use HTTPS in production
- Log authentication failures for monitoring

### Database Considerations

#### SQLite (Development)
- File-based database, easy setup for development
- Good for local development and testing
- No additional infrastructure required
- Limitations in concurrent access (acceptable for development)

#### PostgreSQL (Production)
- Robust, production-ready relational database
- Excellent performance and scalability
- Neon PostgreSQL provides serverless deployment
- SSL connections ensure data security in transit

### CORS Configuration

Cross-Origin Resource Sharing (CORS) must be properly configured to allow frontend requests:
- Allow frontend origin (http://localhost:3000 for development)
- Allow required HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Allow Authorization header for JWT tokens
- Allow Content-Type header for JSON requests

## Alternative Approaches Considered

### Authentication Alternatives

1. **Session-based authentication**: Requires server-side session storage, not suitable for stateless API
2. **OAuth2**: More complex than needed for this application
3. **API Keys**: Less secure and user-friendly than JWT
4. **Custom token system**: Would require more development time and introduce potential security issues

**Selected Approach**: JWT with shared secret provides the right balance of security, simplicity, and statelessness.

### Database Alternatives

1. **MongoDB**: NoSQL document database, but our data structure is relational
2. **MySQL**: Another SQL option, but PostgreSQL offers better features for our needs
3. **SQLite for production**: Not suitable for production workloads

**Selected Approach**: SQLite for development, PostgreSQL for production provides the best combination of ease of development and production readiness.

### API Design Alternatives

1. **GraphQL**: More flexible but adds complexity for simple CRUD operations
2. **gRPC**: Better for microservices communication but overkill for this use case
3. **REST with HATEOAS**: More complex than needed for simple task management

**Selected Approach**: Standard RESTful API provides simplicity and broad compatibility.

## Performance Considerations

### Database Indexing
- Index on user_id for efficient user-specific queries
- Index on completed for efficient status filtering
- Composite index on (user_id, completed) for common query patterns

### Response Times
- Target response times under 500ms for all operations
- Use efficient database queries with proper WHERE clauses
- Consider query optimization for large datasets

### Concurrency
- FastAPI's async capabilities handle concurrent requests well
- Database connection pooling for efficient resource usage
- Stateless design allows horizontal scaling

## Security Considerations

### Input Validation
- Validate all input data with Pydantic schemas
- Sanitize user inputs to prevent injection attacks
- Enforce data size limits to prevent denial of service

### Authentication Security
- Use strong, randomly generated secrets
- Store secrets only in environment variables
- Implement proper error handling without revealing sensitive information
- Log authentication failures for security monitoring

### Data Protection
- User isolation enforced at the database query level
- No direct access to tasks without proper authentication
- SSL connections for production database

## Integration Considerations

### Frontend Integration
- JSON response formats matched to frontend expectations
- Consistent error response structures
- Proper HTTP status codes for different scenarios
- CORS properly configured for frontend origin

### Deployment Integration
- Environment-based configuration for different environments
- Database migration strategy for schema changes
- Monitoring and logging for production deployment

## Development Tools and Libraries

### Core Dependencies
- **fastapi**: Web framework
- **sqlmodel**: ORM for database interactions
- **pydantic**: Data validation and settings management
- **pyjwt**: JWT token handling
- **uvicorn**: ASGI server for running the application
- **python-dotenv**: Environment variable management

### Development Dependencies
- **pytest**: Testing framework
- **httpx**: Testing HTTP client
- **alembic**: Database migrations (if needed)

## Testing Strategy

### Unit Testing
- Test individual functions in crud.py
- Test authentication and authorization logic
- Test data validation and error handling

### Integration Testing
- Test API endpoints with various inputs
- Test database operations
- Test authentication flow

### Manual Testing
- Use curl or Postman to test endpoints
- Verify integration with frontend
- Test edge cases and error conditions

## Deployment Considerations

### Containerization
- Docker image for consistent deployment
- Multi-stage builds for smaller production images
- Environment-specific configuration

### Cloud Deployment
- Neon PostgreSQL for production database
- Consider serverless deployment options
- SSL termination at load balancer

### Monitoring
- Application logging
- Database performance monitoring
- Authentication failure tracking

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

## Conclusion

The chosen technology stack (FastAPI + SQLModel + JWT) provides an excellent foundation for building a secure, performant, and maintainable backend for the Todo application. The implementation approach balances development speed with security and scalability requirements. All key decisions have been made with careful consideration of tradeoffs, and the resulting architecture is well-suited to meet all specified requirements.