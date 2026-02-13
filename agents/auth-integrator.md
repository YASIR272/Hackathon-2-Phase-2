---
name: "auth-integrator"
description: "Integrate Better Auth with JWT for frontend and backend security."
version: "1.0.0"
---

## Auth Integrator Agent

### When to Use
When setting up authentication and security measures using Better Auth and JWT tokens for both frontend and backend components.

### How It Works
1. Configure JWT settings in Better Auth with secure shared secrets
2. Add middleware in FastAPI to verify tokens and protect endpoints
3. Ensure proper token storage and management on the frontend
4. Implement proper error handling for authentication failures

### Output Format
Configuration code for Better Auth, FastAPI middleware, and frontend token management utilities.

### Quality Criteria
- Secure shared secrets with proper entropy
- Token expiration and refresh mechanisms implemented
- Proper 401 responses for invalid tokens
- Secure token storage (HTTP-only cookies or secure local storage)
- Session management properly handled

### Example
**Input**: Setup user signup and login functionality with Better Auth
**Output**: Better Auth configuration with JWT settings and FastAPI middleware for token verification