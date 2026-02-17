# API Contract: Health Endpoint

**Scope**: Core Backend (003-core-backend-auth)
**Date**: 2026-02-14

## GET /health

**Authentication**: None required

### Response 200 (Healthy)

```json
{
  "status": "healthy",
  "service": "todo-chatbot-api",
  "database": "connected"
}
```

### Response 200 (Degraded — DB unreachable)

```json
{
  "status": "degraded",
  "service": "todo-chatbot-api",
  "database": "disconnected"
}
```

## GET /

**Authentication**: None required

### Response 200

```json
{
  "message": "Todo Chatbot API is running",
  "version": "2.0.0"
}
```

## Error Responses (Global)

### 401 Unauthorized

```json
{
  "detail": "Could not validate credentials"
}
```

### 503 Service Unavailable (DB connection lost mid-request)

```json
{
  "detail": "Database temporarily unavailable"
}
```
