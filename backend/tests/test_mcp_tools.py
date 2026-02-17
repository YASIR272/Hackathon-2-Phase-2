"""Unit and integration tests for MCP server tools.

Tests all 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
using an in-memory SQLite database for unit tests, and stdio client for integration tests.
"""

import json
import sys
import os
import asyncio
import pytest
from sqlmodel import SQLModel, Session, create_engine

# Add backend to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models import Task


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(name="engine")
def fixture_engine():
    """Create an in-memory SQLite engine for testing."""
    test_engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(test_engine)
    return test_engine


@pytest.fixture(name="session")
def fixture_session(engine):
    """Create a fresh session for each test."""
    with Session(engine) as session:
        yield session


@pytest.fixture(autouse=True)
def patch_engine(engine, monkeypatch):
    """Patch the mcp_server module to use the test engine."""
    import mcp_server
    monkeypatch.setattr(mcp_server, "engine", engine)


@pytest.fixture()
def seed_tasks(session):
    """Seed the database with test tasks for alice and bob."""
    tasks = [
        Task(user_id="alice", title="Alice Task 1", description="Description 1", completed=False),
        Task(user_id="alice", title="Alice Task 2", completed=False),
        Task(user_id="alice", title="Alice Task 3 (done)", completed=True),
        Task(user_id="bob", title="Bob Task 1", completed=False),
        Task(user_id="bob", title="Bob Task 2 (done)", completed=True),
    ]
    for t in tasks:
        session.add(t)
    session.commit()
    for t in tasks:
        session.refresh(t)
    return tasks


# ===========================================================================
# add_task tests
# ===========================================================================

class TestAddTask:
    def test_create_task_success(self):
        from mcp_server import add_task
        result = json.loads(add_task(user_id="alice", title="Buy groceries"))
        assert result["status"] == "created"
        assert result["title"] == "Buy groceries"
        assert "task_id" in result

    def test_create_task_with_description(self):
        from mcp_server import add_task
        result = json.loads(add_task(user_id="alice", title="Buy groceries", description="Milk, eggs, bread"))
        assert result["status"] == "created"
        assert result["title"] == "Buy groceries"

    def test_create_task_missing_title(self):
        from mcp_server import add_task
        result = json.loads(add_task(user_id="alice", title=""))
        assert "error" in result
        assert result["error"] == "Title is required"

    def test_create_task_whitespace_title(self):
        from mcp_server import add_task
        result = json.loads(add_task(user_id="alice", title="   "))
        assert "error" in result
        assert result["error"] == "Title is required"

    def test_create_task_title_too_long(self):
        from mcp_server import add_task
        result = json.loads(add_task(user_id="alice", title="x" * 256))
        assert "error" in result
        assert "255" in result["error"]

    def test_user_isolation(self, engine):
        from mcp_server import add_task, list_tasks
        add_task(user_id="alice", title="Alice only")
        add_task(user_id="bob", title="Bob only")

        alice_tasks = json.loads(list_tasks(user_id="alice"))
        bob_tasks = json.loads(list_tasks(user_id="bob"))

        alice_titles = [t["title"] for t in alice_tasks]
        bob_titles = [t["title"] for t in bob_tasks]

        assert "Alice only" in alice_titles
        assert "Bob only" not in alice_titles
        assert "Bob only" in bob_titles
        assert "Alice only" not in bob_titles


# ===========================================================================
# list_tasks tests
# ===========================================================================

class TestListTasks:
    def test_list_all_tasks(self, seed_tasks):
        from mcp_server import list_tasks
        result = json.loads(list_tasks(user_id="alice", status="all"))
        assert len(result) == 3

    def test_list_pending_tasks(self, seed_tasks):
        from mcp_server import list_tasks
        result = json.loads(list_tasks(user_id="alice", status="pending"))
        assert len(result) == 2
        assert all(not t["completed"] for t in result)

    def test_list_completed_tasks(self, seed_tasks):
        from mcp_server import list_tasks
        result = json.loads(list_tasks(user_id="alice", status="completed"))
        assert len(result) == 1
        assert all(t["completed"] for t in result)

    def test_list_default_status(self, seed_tasks):
        from mcp_server import list_tasks
        result = json.loads(list_tasks(user_id="alice"))
        assert len(result) == 3  # defaults to "all"

    def test_list_empty(self):
        from mcp_server import list_tasks
        result = json.loads(list_tasks(user_id="nobody"))
        assert result == []

    def test_list_invalid_status(self):
        from mcp_server import list_tasks
        result = json.loads(list_tasks(user_id="alice", status="invalid"))
        assert "error" in result

    def test_user_isolation(self, seed_tasks):
        from mcp_server import list_tasks
        alice_tasks = json.loads(list_tasks(user_id="alice"))
        bob_tasks = json.loads(list_tasks(user_id="bob"))
        assert len(alice_tasks) == 3
        assert len(bob_tasks) == 2

    def test_response_schema(self, seed_tasks):
        from mcp_server import list_tasks
        result = json.loads(list_tasks(user_id="alice"))
        for task in result:
            assert "id" in task
            assert "title" in task
            assert "completed" in task
            assert isinstance(task["id"], int)
            assert isinstance(task["title"], str)
            assert isinstance(task["completed"], bool)


# ===========================================================================
# complete_task tests
# ===========================================================================

class TestCompleteTask:
    def test_complete_task_success(self, seed_tasks):
        from mcp_server import complete_task
        task_id = seed_tasks[0].id  # Alice Task 1 (pending)
        result = json.loads(complete_task(user_id="alice", task_id=task_id))
        assert result["task_id"] == task_id
        assert result["status"] == "completed"
        assert result["title"] == "Alice Task 1"

    def test_complete_task_not_found(self):
        from mcp_server import complete_task
        result = json.loads(complete_task(user_id="alice", task_id=9999))
        assert "error" in result
        assert result["error"] == "Task not found"

    def test_complete_task_cross_user_rejection(self, seed_tasks):
        from mcp_server import complete_task
        alice_task_id = seed_tasks[0].id
        result = json.loads(complete_task(user_id="bob", task_id=alice_task_id))
        assert "error" in result
        assert result["error"] == "Task not found"


# ===========================================================================
# delete_task tests
# ===========================================================================

class TestDeleteTask:
    def test_delete_task_success(self, seed_tasks):
        from mcp_server import delete_task, list_tasks
        task_id = seed_tasks[0].id
        result = json.loads(delete_task(user_id="alice", task_id=task_id))
        assert result["task_id"] == task_id
        assert result["status"] == "deleted"
        assert result["title"] == "Alice Task 1"

        # Verify task is removed
        remaining = json.loads(list_tasks(user_id="alice"))
        remaining_ids = [t["id"] for t in remaining]
        assert task_id not in remaining_ids

    def test_delete_task_not_found(self):
        from mcp_server import delete_task
        result = json.loads(delete_task(user_id="alice", task_id=9999))
        assert "error" in result
        assert result["error"] == "Task not found"

    def test_delete_task_cross_user_rejection(self, seed_tasks):
        from mcp_server import delete_task
        alice_task_id = seed_tasks[0].id
        result = json.loads(delete_task(user_id="bob", task_id=alice_task_id))
        assert "error" in result
        assert result["error"] == "Task not found"


# ===========================================================================
# update_task tests
# ===========================================================================

class TestUpdateTask:
    def test_update_title_only(self, seed_tasks):
        from mcp_server import update_task
        task_id = seed_tasks[0].id
        result = json.loads(update_task(user_id="alice", task_id=task_id, title="Updated Title"))
        assert result["task_id"] == task_id
        assert result["status"] == "updated"
        assert result["title"] == "Updated Title"

    def test_update_description_only(self, seed_tasks):
        from mcp_server import update_task
        task_id = seed_tasks[0].id
        result = json.loads(update_task(user_id="alice", task_id=task_id, description="New desc"))
        assert result["status"] == "updated"
        assert result["title"] == "Alice Task 1"  # title unchanged

    def test_update_both_fields(self, seed_tasks):
        from mcp_server import update_task
        task_id = seed_tasks[0].id
        result = json.loads(update_task(user_id="alice", task_id=task_id, title="New Title", description="New desc"))
        assert result["status"] == "updated"
        assert result["title"] == "New Title"

    def test_update_no_fields(self, seed_tasks):
        from mcp_server import update_task
        task_id = seed_tasks[0].id
        result = json.loads(update_task(user_id="alice", task_id=task_id))
        assert "error" in result
        assert result["error"] == "No fields to update"

    def test_update_task_not_found(self):
        from mcp_server import update_task
        result = json.loads(update_task(user_id="alice", task_id=9999, title="Test"))
        assert "error" in result
        assert result["error"] == "Task not found"

    def test_update_task_cross_user_rejection(self, seed_tasks):
        from mcp_server import update_task
        alice_task_id = seed_tasks[0].id
        result = json.loads(update_task(user_id="bob", task_id=alice_task_id, title="Hacked"))
        assert "error" in result
        assert result["error"] == "Task not found"

    def test_update_title_too_long(self, seed_tasks):
        from mcp_server import update_task
        task_id = seed_tasks[0].id
        result = json.loads(update_task(user_id="alice", task_id=task_id, title="x" * 256))
        assert "error" in result
        assert "255" in result["error"]


# ===========================================================================
# Integration tests — MCP server via stdio
# ===========================================================================

BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..")
MCP_SERVER_PATH = os.path.join(BACKEND_DIR, "mcp_server.py")

EXPECTED_TOOL_NAMES = {"add_task", "list_tasks", "complete_task", "delete_task", "update_task"}


@pytest.mark.integration
class TestMCPServerIntegration:
    """Integration tests that start the MCP server as a subprocess via stdio."""

    TEST_DB_PATH = os.path.join(BACKEND_DIR, "test.db")

    @pytest.fixture(autouse=True)
    def set_test_env(self, monkeypatch):
        """Ensure the MCP server uses a test SQLite DB and create tables."""
        monkeypatch.setenv("TESTING", "true")
        # Create the test database with tables before starting the MCP server
        test_engine = create_engine(
            f"sqlite:///{self.TEST_DB_PATH}",
            connect_args={"check_same_thread": False},
        )
        SQLModel.metadata.create_all(test_engine)
        test_engine.dispose()
        yield
        # Clean up test database after tests
        if os.path.exists(self.TEST_DB_PATH):
            os.remove(self.TEST_DB_PATH)

    async def _connect_and_run(self, callback):
        """Helper to connect to the MCP server and run a callback with the session."""
        from mcp.client.stdio import stdio_client
        from mcp import ClientSession, StdioServerParameters

        server_params = StdioServerParameters(
            command=sys.executable,
            args=[MCP_SERVER_PATH],
            env={**os.environ, "TESTING": "true"},
        )
        async with stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                return await callback(session)

    @pytest.mark.asyncio
    async def test_tool_discovery(self):
        """SC-001: 5 tools discoverable with correct schemas."""
        async def check_tools(session):
            tools_result = await session.list_tools()
            tool_names = {t.name for t in tools_result.tools}
            assert tool_names == EXPECTED_TOOL_NAMES
            assert len(tools_result.tools) == 5
            # Verify each tool has a description and input schema
            for tool in tools_result.tools:
                assert tool.description, f"Tool {tool.name} missing description"
                assert tool.inputSchema, f"Tool {tool.name} missing input schema"
            return tool_names

        result = await self._connect_and_run(check_tools)
        assert result == EXPECTED_TOOL_NAMES

    @pytest.mark.asyncio
    async def test_add_and_list_tasks_e2e(self):
        """SC-002 + SC-003: Task creation and listing end-to-end."""
        async def run_e2e(session):
            # Add a task
            add_result = await session.call_tool("add_task", {
                "user_id": "integration_user",
                "title": "Integration Test Task",
                "description": "Created during integration test",
            })
            add_text = add_result.content[0].text
            assert add_text, f"Empty response from add_task. Full result: {add_result}"
            add_data = json.loads(add_text)
            assert add_data["status"] == "created"
            assert add_data["title"] == "Integration Test Task"
            task_id = add_data["task_id"]

            # List tasks
            list_result = await session.call_tool("list_tasks", {
                "user_id": "integration_user",
            })
            list_text = list_result.content[0].text
            assert list_text, f"Empty response from list_tasks. Full result: {list_result}"
            list_data = json.loads(list_text)
            assert any(t["id"] == task_id for t in list_data)

            return task_id

        await self._connect_and_run(run_e2e)

    @pytest.mark.asyncio
    async def test_complete_and_delete_e2e(self):
        """End-to-end complete and delete."""
        async def run_e2e(session):
            # Add
            add_result = await session.call_tool("add_task", {
                "user_id": "e2e_user",
                "title": "E2E Task",
            })
            task_id = json.loads(add_result.content[0].text)["task_id"]

            # Complete
            complete_result = await session.call_tool("complete_task", {
                "user_id": "e2e_user",
                "task_id": task_id,
            })
            complete_data = json.loads(complete_result.content[0].text)
            assert complete_data["status"] == "completed"

            # Delete
            delete_result = await session.call_tool("delete_task", {
                "user_id": "e2e_user",
                "task_id": task_id,
            })
            delete_data = json.loads(delete_result.content[0].text)
            assert delete_data["status"] == "deleted"

        await self._connect_and_run(run_e2e)

    @pytest.mark.asyncio
    async def test_error_cases_e2e(self):
        """SC-005: All error cases return structured JSON (no crashes)."""
        async def run_errors(session):
            # Task not found
            result = await session.call_tool("complete_task", {
                "user_id": "nobody",
                "task_id": 99999,
            })
            data = json.loads(result.content[0].text)
            assert "error" in data

            # Empty title
            result = await session.call_tool("add_task", {
                "user_id": "nobody",
                "title": "",
            })
            data = json.loads(result.content[0].text)
            assert "error" in data

            # Invalid status filter
            result = await session.call_tool("list_tasks", {
                "user_id": "nobody",
                "status": "invalid",
            })
            data = json.loads(result.content[0].text)
            assert "error" in data

        await self._connect_and_run(run_errors)

    @pytest.mark.asyncio
    async def test_user_isolation_e2e(self):
        """SC-004: Multi-user isolation — zero cross-user leakage."""
        async def run_isolation(session):
            # Add tasks for two users
            await session.call_tool("add_task", {"user_id": "user_a", "title": "A's task"})
            await session.call_tool("add_task", {"user_id": "user_b", "title": "B's task"})

            # List for user_a
            result_a = await session.call_tool("list_tasks", {"user_id": "user_a"})
            tasks_a = json.loads(result_a.content[0].text)

            # List for user_b
            result_b = await session.call_tool("list_tasks", {"user_id": "user_b"})
            tasks_b = json.loads(result_b.content[0].text)

            # Verify isolation
            a_titles = [t["title"] for t in tasks_a]
            b_titles = [t["title"] for t in tasks_b]
            assert "A's task" in a_titles
            assert "B's task" not in a_titles
            assert "B's task" in b_titles
            assert "A's task" not in b_titles

        await self._connect_and_run(run_isolation)
