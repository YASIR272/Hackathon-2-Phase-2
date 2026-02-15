# Quickstart: MCP Server and All Task Tools

**Feature**: 004-mcp-server-task-tools

## Prerequisites

- Python 3.11+
- Existing backend from Spec 1 (003-core-backend-auth) with database configured
- Virtual environment activated

## Setup

### 1. Install MCP dependency

```bash
cd backend
pip install -r requirements.txt  # After mcp is added
```

### 2. Verify database is configured

Ensure `backend/.env` has a valid `DATABASE_URL`:

```env
# For local development:
DATABASE_URL=sqlite:///./todo.db

# For production (Neon):
DATABASE_URL=postgresql://user:pass@host/dbname
```

### 3. Run the MCP server

```bash
cd backend
python mcp_server.py
```

The server starts on stdio transport — it reads JSON-RPC from stdin and writes
to stdout. This is how the OpenAI Agent will connect to it.

## Verify It Works

### List available tools

Connect with any MCP client (or the test script) and send a `tools/list` request.
Expected response: 5 tools (add_task, list_tasks, complete_task, delete_task, update_task).

### Call a tool

Example: Create a task

```json
{
  "method": "tools/call",
  "params": {
    "name": "add_task",
    "arguments": {
      "user_id": "test-user",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread"
    }
  }
}
```

Expected response:
```json
{"task_id": 1, "status": "created", "title": "Buy groceries"}
```

## Running Tests

```bash
cd backend
python -m pytest tests/test_mcp_tools.py -v
```

## Architecture Summary

```
OpenAI Agent  --(stdio)-->  mcp_server.py  --(SQLModel Session)-->  Neon PostgreSQL
                                |
                         imports: database.engine
                         imports: models.Task
```

- **mcp_server.py**: Single file with 5 `@mcp.tool()` decorated functions
- **database.py**: Shared engine (same as FastAPI)
- **models.py**: Shared Task model (same as FastAPI)
- **Transport**: stdio (agent spawns MCP server as subprocess)
