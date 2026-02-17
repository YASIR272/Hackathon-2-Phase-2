# API Contract: Authentication Dependency

**Scope**: Core Backend (003-core-backend-auth)
**Date**: 2026-02-14

## FastAPI Dependency: `get_current_user_id`

Extracts and validates user_id from the Authorization header.

### Input

```
Authorization: Bearer <jwt-token>
```

### Token Verification

- Algorithm: HS256
- Secret: `BETTER_AUTH_SECRET` environment variable
- Claims checked: `sub` → `userId` → `id` (first non-null)
- Expiration: verified automatically by PyJWT

### Output (Success)

Returns `str` — the user_id extracted from the token.

### Output (Failure)

| Condition | Status | Detail |
|-----------|--------|--------|
| No Authorization header | 401 | "Not authenticated" |
| Invalid/malformed token | 401 | "Could not validate credentials" |
| Expired token | 401 | "Token has expired" |
| Empty/null user_id in token | 401 | "Invalid user identity" |

### Usage in Route Handlers

```python
@router.get("/api/{user_id}/example")
def example(
    user_id: str,
    current_user: str = Depends(get_current_user_id)
):
    # current_user is always a non-empty string
    ...
```

### Backward Compatibility

- Existing Phase II routes using `verify_token` and
  `get_current_user_id` MUST continue to work.
- Demo mode fallback (`"demo-user"`) is preserved for
  unauthenticated Phase II requests.
