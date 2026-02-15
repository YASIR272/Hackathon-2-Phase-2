# Research: MCP Server and All Task Tools

**Feature**: 004-mcp-server-task-tools
**Date**: 2026-02-14

## Research Topic 1: Official MCP Python SDK — Server Creation

**Decision**: Use `FastMCP` from `mcp.server.fastmcp` (part of the official `mcp` PyPI package)

**Rationale**:
- The `mcp` package (v1.26.0+) includes both a low-level API (`mcp.server.lowlevel.Server`)
  and a high-level API (`mcp.server.fastmcp.FastMCP`)
- FastMCP is NOT a third-party wrapper — it is the official high-level API within the `mcp` package
- Auto-generates JSON Schema from Python type hints and docstrings
- `@mcp.tool()` decorator for registering tools
- `mcp.run(transport="stdio")` for running with stdio transport

**Alternatives considered**:
- Low-level `mcp.server.lowlevel.Server`: Requires manual `@server.list_tools()` and
  `@server.call_tool()` handlers, manual JSON Schema writing. More boilerplate, same result.
- Third-party FastMCP package: NOT the same as `mcp.server.fastmcp`. Constitution prohibits
  third-party wrappers.

**Key code pattern**:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("todo-task-server")

@mcp.tool()
def add_task(user_id: str, title: str, description: str = "") -> str:
    """Create a new task for the user."""
    # ... DB logic ...
    return json.dumps({"task_id": id, "status": "created", "title": title})

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

## Research Topic 2: Transport — stdio vs HTTP/SSE

**Decision**: stdio transport

**Rationale**:
- OpenAI Agents SDK connects to MCP servers via subprocess (stdio)
- No port conflicts with FastAPI (port 8000)
- Simplest setup: agent starts MCP server as `python mcp_server.py`
- No CORS, no TLS, no network config needed

**Alternatives considered**:
- HTTP/SSE: Requires separate port, CORS middleware, more config. Only needed for
  remote MCP servers. Our MCP server is co-located with the agent.

## Research Topic 3: Sharing SQLModel Engine Between FastAPI and MCP

**Decision**: Direct import from `backend/database.py`

**Rationale**:
- `backend/database.py` exports `engine` (SQLModel/SQLAlchemy engine) and `get_session()`
- MCP server runs from the same `backend/` directory, so `from database import engine` works
- `Session(engine)` provides synchronous DB sessions
- The engine is built from `config.settings.database_url`, reading from `.env`
- Both FastAPI and MCP server share the same DB without duplication

**Key pattern**:
```python
from sqlmodel import Session, select
from database import engine
from models import Task

def tool_function(user_id: str, ...):
    with Session(engine) as session:
        # query scoped by user_id
        statement = select(Task).where(Task.user_id == user_id)
        ...
```

## Research Topic 4: Tool Descriptions for Agent Routing

**Decision**: Rich docstrings with purpose, parameter descriptions, and usage context

**Rationale**:
- The OpenAI Agent uses tool descriptions to decide which MCP tool to invoke
- Per the Agent Behavior Specification:
  - "Add a task to buy groceries" → add_task
  - "Show me all my tasks" → list_tasks with status "all"
  - "Mark task 3 as complete" → complete_task with task_id 3
- Rich descriptions improve routing accuracy
- FastMCP extracts docstrings automatically as tool descriptions
- Args section in docstring becomes parameter descriptions

**Key pattern**:
```python
@mcp.tool()
def add_task(user_id: str, title: str, description: str = "") -> str:
    """Create a new task for the user's todo list.

    Use this tool when the user wants to add, create, or remember something.
    Examples: "Add a task to buy groceries", "I need to remember to pay bills"

    Args:
        user_id: The authenticated user's unique identifier
        title: The task title (what needs to be done)
        description: Optional additional details about the task
    """
```

## Research Topic 5: MCP SDK Return Types

**Decision**: Return plain strings (JSON-serialized dicts) from tool functions

**Rationale**:
- FastMCP auto-wraps return values as `TextContent`
- Returning `json.dumps({"task_id": 5, "status": "created", "title": "Buy groceries"})`
  becomes `TextContent(type="text", text='{"task_id": 5, ...}')`
- The OpenAI agent receives the text and parses the JSON
- Matches the Phase III requirement examples exactly

**Alternative**: Return `CallToolResult` directly — unnecessary overhead for simple JSON responses.

## Research Topic 6: MCP SDK Installation

**Decision**: Add `mcp>=1.0.0` to `backend/requirements.txt`

**Rationale**:
- The `mcp` package on PyPI is the official MCP Python SDK
- Requires Python >=3.10 (project uses 3.11+)
- Install: `pip install mcp`
- Constitution VII requires version pinning in requirements files
