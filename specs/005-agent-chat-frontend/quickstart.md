# Quickstart: OpenAI Agent, Chat Endpoint & ChatKit Frontend

## Prerequisites

- Python 3.11+ with `openai-agents` and existing backend dependencies installed
- Node.js 18+ (for frontend)
- `OPENAI_API_KEY` environment variable set
- Backend `.env` configured (database, auth)
- MCP server from Spec 2 (`backend/mcp_server.py`) working

## Quick Verification Steps

### 1. Install new backend dependency

```bash
cd backend
pip install openai-agents
```

### 2. Verify chat endpoint works

```bash
# Start the FastAPI server
uvicorn main:app --reload --port 8000

# Test chat endpoint (replace USER_ID and TOKEN)
curl -X POST http://localhost:8000/api/USER_ID/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'
```

Expected response:
```json
{
  "conversation_id": 1,
  "response": "I've added 'Buy groceries' to your task list!",
  "tool_calls": [
    {
      "tool_name": "add_task",
      "arguments": {"user_id": "...", "title": "Buy groceries"},
      "result": "{\"task_id\": 1, \"status\": \"created\", \"title\": \"Buy groceries\"}"
    }
  ]
}
```

### 3. Test conversation continuity

```bash
# Continue the same conversation
curl -X POST http://localhost:8000/api/USER_ID/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all my tasks", "conversation_id": 1}'
```

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### 5. Verify ChatKit loads

1. Open browser to frontend URL
2. ChatKit chat interface should be visible
3. Type "Add a task to test ChatKit" and submit
4. Response should appear with task creation confirmation

## Manual Verification Checklist

- [ ] Chat endpoint creates new conversation when no conversation_id provided
- [ ] Chat endpoint continues existing conversation with conversation_id
- [ ] Agent calls correct MCP tool for "Add a task to buy groceries"
- [ ] Agent calls list_tasks for "Show me all my tasks"
- [ ] Agent calls complete_task for "Mark task 1 as done"
- [ ] Agent calls delete_task for "Delete task 1"
- [ ] Agent calls update_task for "Rename task 1 to Call mom"
- [ ] Multi-user isolation: User A cannot see User B's tasks or conversations
- [ ] Conversation survives server restart
- [ ] ChatKit frontend loads and displays chat interface
- [ ] Messages sent from ChatKit appear in backend
- [ ] Tool calls are visible in the response

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| OPENAI_API_KEY | Yes | OpenAI API key for agent |
| DATABASE_URL | Yes | Neon PostgreSQL connection string |
| BETTER_AUTH_SECRET | Yes | JWT signing secret |
| FRONTEND_ORIGIN | Yes | Frontend URL for CORS |
| VITE_API_BASE_URL | No | Backend URL for frontend (default: http://localhost:8000) |

## ChatKit Domain Allowlist — Production Deployment

When deploying the ChatKit frontend to a production domain, the ChatKit CDN
script requires domain authorization from OpenAI.

### Step-by-step setup

1. **Go to the OpenAI Platform dashboard**: Navigate to
   [platform.openai.com](https://platform.openai.com) and sign in.

2. **Open ChatKit settings**: Go to Settings > ChatKit (or Deployments > ChatKit)
   in the dashboard sidebar.

3. **Add your production domain**: Enter your production domain
   (e.g., `chat.yourdomain.com`) in the domain allowlist.

4. **Copy the domain key**: After adding the domain, OpenAI will generate a
   `domainKey` string. Copy this value.

5. **Configure the frontend**: In `chatkit-frontend/src/config.ts`, the CDN
   script in `index.html` will use this domain key automatically when loaded
   from the allowlisted domain.

6. **Update CORS**: Add your production frontend domain to the backend's
   `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://chat.yourdomain.com
   ```

7. **Deploy and verify**: Deploy the frontend, open the production URL,
   and verify the chat interface loads without security errors.

### Local development

For local development (`localhost`), the ChatKit CDN script works without a
domain key. No allowlist configuration is needed for `localhost`.
