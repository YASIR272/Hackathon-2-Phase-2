"""Unit tests for the chat endpoint.

Tests conversation CRUD, message persistence, validation errors, and ownership checks
using an in-memory SQLite database with mocked agent responses.
"""

import sys
import os
import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine

# Add backend to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models import Task, Conversation, Message


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
    """Create a session for testing."""
    with Session(engine) as session:
        yield session


@pytest.fixture(name="mock_agent")
def fixture_mock_agent():
    """Create a mock agent that returns a predictable response."""
    mock_result = MagicMock()
    mock_result.final_output = "I've added 'Buy groceries' to your task list!"
    mock_result.new_items = []

    with patch("routes.chat.get_agent") as mock_get_agent, \
         patch("routes.chat.Runner") as mock_runner:
        mock_agent = MagicMock()
        mock_get_agent.return_value = mock_agent
        mock_runner.run = AsyncMock(return_value=mock_result)
        yield mock_result


@pytest.fixture(name="client")
def fixture_client(engine, mock_agent):
    """Create a test client with mocked dependencies."""
    from main import app
    from database import get_session

    def override_session():
        with Session(engine) as session:
            yield session

    def override_auth():
        return "test-user-alice"

    app.dependency_overrides[get_session] = override_session

    from auth import get_current_user_id
    app.dependency_overrides[get_current_user_id] = override_auth

    yield TestClient(app)

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Test: Conversation Creation (T012)
# ---------------------------------------------------------------------------

class TestConversationCreation:
    """Tests for creating new conversations."""

    def test_new_conversation_created_when_no_id_provided(self, client):
        """POST without conversation_id creates a new conversation."""
        response = client.post(
            "/api/test-user-alice/chat",
            json={"message": "Add a task to buy groceries"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "conversation_id" in data
        assert data["conversation_id"] > 0

    def test_response_contains_required_fields(self, client):
        """Response matches ChatResponse schema."""
        response = client.post(
            "/api/test-user-alice/chat",
            json={"message": "Hello"},
        )
        data = response.json()
        assert "conversation_id" in data
        assert "response" in data
        assert "tool_calls" in data
        assert isinstance(data["tool_calls"], list)


# ---------------------------------------------------------------------------
# Test: Message Validation (T010)
# ---------------------------------------------------------------------------

class TestMessageValidation:
    """Tests for input validation."""

    def test_empty_message_rejected(self, client):
        """Empty message returns 400."""
        response = client.post(
            "/api/test-user-alice/chat",
            json={"message": ""},
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Message cannot be empty"

    def test_whitespace_only_message_rejected(self, client):
        """Whitespace-only message returns 400."""
        response = client.post(
            "/api/test-user-alice/chat",
            json={"message": "   "},
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Message cannot be empty"


# ---------------------------------------------------------------------------
# Test: Conversation Persistence (T013, T014)
# ---------------------------------------------------------------------------

class TestConversationPersistence:
    """Tests for conversation history persistence."""

    def test_continue_existing_conversation(self, client):
        """Sending a follow-up with conversation_id continues the conversation."""
        # Create a conversation
        r1 = client.post(
            "/api/test-user-alice/chat",
            json={"message": "First message"},
        )
        conv_id = r1.json()["conversation_id"]

        # Continue the conversation
        r2 = client.post(
            "/api/test-user-alice/chat",
            json={"message": "Second message", "conversation_id": conv_id},
        )
        assert r2.status_code == 200
        assert r2.json()["conversation_id"] == conv_id


# ---------------------------------------------------------------------------
# Test: Conversation Ownership (T015, T020)
# ---------------------------------------------------------------------------

class TestConversationOwnership:
    """Tests for conversation ownership validation."""

    def test_invalid_conversation_id_returns_404(self, client):
        """Non-existent conversation_id returns 404."""
        response = client.post(
            "/api/test-user-alice/chat",
            json={"message": "Hello", "conversation_id": 99999},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Conversation not found"

    def test_other_users_conversation_returns_404(self, client, engine):
        """Accessing another user's conversation returns 404."""
        # Create a conversation for a different user directly in DB
        with Session(engine) as session:
            from datetime import datetime, timezone
            conv = Conversation(
                user_id="test-user-bob",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(conv)
            session.commit()
            session.refresh(conv)
            bob_conv_id = conv.id

        # Alice tries to access Bob's conversation
        response = client.post(
            "/api/test-user-alice/chat",
            json={"message": "Hello", "conversation_id": bob_conv_id},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Conversation not found"


# ---------------------------------------------------------------------------
# Test: User Identity Validation (T022)
# ---------------------------------------------------------------------------

class TestUserIdentity:
    """Tests for path/JWT user_id validation."""

    def test_mismatched_user_id_returns_403(self, engine, mock_agent):
        """Path user_id must match authenticated user_id."""
        from main import app
        from database import get_session
        from auth import get_current_user_id

        def override_session():
            with Session(engine) as session:
                yield session

        def override_auth():
            return "test-user-alice"

        app.dependency_overrides[get_session] = override_session
        app.dependency_overrides[get_current_user_id] = override_auth

        client = TestClient(app)

        # Alice tries to use Bob's user_id in the path
        response = client.post(
            "/api/test-user-bob/chat",
            json={"message": "Hello"},
        )
        assert response.status_code == 403

        app.dependency_overrides.clear()
