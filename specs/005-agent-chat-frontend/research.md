# Research: OpenAI Agent, Chat Endpoint, Conversation Management & ChatKit Frontend

**Feature**: 005-agent-chat-frontend
**Date**: 2026-02-15

## Research Topic 1: OpenAI Agents SDK — Agent + Runner + MCP Integration

**Decision**: Use `openai-agents` Python SDK with `MCPServerStdio` for MCP connection

**Rationale**:
- The `openai-agents` package (v0.9.0+) provides `Agent`, `Runner`, and MCP integration
- `MCPServerStdio` spawns the MCP server as a subprocess and manages stdio communication
- `Agent(name=..., instructions=..., mcp_servers=[server])` connects agent to MCP tools
- `Runner.run(agent, input_messages)` or `Runner.run_sync(...)` executes the agent
- `RunResult.final_output` returns the agent's text response
- `RunResult.new_items` contains `ToolCallItem` and `ToolCallOutputItem` for tracking tool calls
- `result.to_input_list()` converts results for multi-turn conversation support
- Requires `OPENAI_API_KEY` environment variable

**Key code pattern**:
```python
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

async with MCPServerStdio(
    name="todo-task-server",
    params={"command": "python", "args": ["mcp_server.py"]},
) as mcp_server:
    agent = Agent(
        name="Todo Assistant",
        instructions="...",  # System prompt with Agent Behavior Spec
        mcp_servers=[mcp_server],
    )
    result = await Runner.run(agent, [{"role": "user", "content": "Add a task..."}])
    print(result.final_output)  # Agent's response text
    # result.new_items contains ToolCallItem, ToolCallOutputItem etc.
```

**Alternatives considered**:
- Direct OpenAI API with function calling: More manual wiring, no built-in MCP support
- LangChain agent: Not an official SDK, violates Constitution Principle VI

## Research Topic 2: ChatKit Integration Mode — Custom API vs Hosted

**Decision**: Use **Custom API mode** (`CustomApiConfig` with `url` + `domainKey`)

**Rationale**:
- ChatKit has two API modes:
  - **Hosted** (`HostedApiConfig`): Uses `getClientSecret`, ChatKit talks to OpenAI's backend directly
  - **Custom** (`CustomApiConfig`): Uses `url` + `domainKey`, ChatKit talks to YOUR backend
- Our architecture requires a custom backend (FastAPI + OpenAI Agent + MCP tools)
- Custom mode lets ChatKit POST messages to our `/api/{user_id}/chat` endpoint
- The `domainKey` is required for production (from OpenAI's domain allowlist)
- For local development, `domainKey: "local-dev"` works

**Key configuration**:
```javascript
// React setup
import { ChatKit, useChatKit } from "@openai/chatkit-react";

const chatKit = useChatKit({
  api: {
    url: "http://localhost:8000/api/{user_id}/chat",  // Our FastAPI backend
    domainKey: "local-dev",  // or production key
  },
  theme: { colorScheme: "light" },
});
```

**Important**: Custom API mode requires the backend to implement the ChatKit
protocol (specific request/response format). We need to verify the exact
protocol or use ChatKit as a pure UI wrapper with custom fetch logic.

**Alternatives considered**:
- Hosted mode: Would bypass our backend entirely; agent would need to run client-side
- Pure custom React chat UI: Violates Constitution Principle III (must use ChatKit)

## Research Topic 3: ChatKit Backend Protocol Requirements

**Decision**: Use ChatKit as a **UI-only component** with custom message handling
via `onSendMessage` callback and manual thread rendering

**Rationale**:
- ChatKit's Custom API mode (`url` + `domainKey`) expects the backend to implement
  the OpenAI Responses-compatible wire protocol — this is overly complex for our
  custom agent backend
- Instead, we use ChatKit React components (`<ChatKit>`, `useChatKit`) as a UI shell:
  1. Intercept user messages via `onSendMessage` callback
  2. Send them to our `POST /api/{user_id}/chat` endpoint via standard fetch
  3. Render the response in ChatKit's thread UI using `addMessage()` or equivalent
- The ChatKit CDN script is still loaded for rendering support:
  `<script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>`
- This gives us full control over the request/response cycle while using ChatKit
  for polished UI (Constitution Principle III compliance)

## Research Topic 4: Conversation Flow — Stateless Request Cycle

**Decision**: Implement the exact flow from the Phase III requirements

**The flow per request**:
1. Receive POST `/api/{user_id}/chat` with `{message, conversation_id?}`
2. If no `conversation_id`: create new Conversation in DB, get new ID
3. Fetch conversation history (Messages) from DB for this conversation
4. Store user message in DB (role="user")
5. Build agent input: history messages + new user message
6. Run OpenAI Agent with MCP tools
7. Extract: final_output (text), tool calls from new_items
8. Store assistant message in DB (role="assistant")
9. Return `{conversation_id, response, tool_calls}`
10. Server holds NO state — ready for next request

**Key design decisions**:
- Conversation history truncation: last 50 messages (configurable)
- User message stored BEFORE agent runs (ensures persistence even on agent failure)
- Agent context includes user_id in system prompt so tools scope correctly
- Tool calls extracted from `RunResult.new_items` (ToolCallItem instances)

## Research Topic 5: System Prompt Engineering for the Agent

**Decision**: Rich system prompt including Agent Behavior Spec, tool rules, and user_id injection

**System prompt template**:
```
You are a helpful todo task manager assistant. You help users manage their
tasks through natural language conversation.

The current user's ID is: {user_id}
Always pass this user_id when calling any MCP tool.

## Tool Usage Rules
- When the user mentions adding/creating/remembering something → use add_task
- When the user asks to see/show/list tasks → use list_tasks with appropriate filter
- When the user says done/complete/finished → use complete_task
- When the user says delete/remove/cancel → use delete_task
- When the user says change/update/rename → use update_task

## Response Rules
- Always confirm actions with a friendly response
- Format task lists in a readable way
- Handle errors gracefully with helpful messages
- Never expose raw JSON to the user
```

## Research Topic 6: Auth Flow — Frontend to Backend to Agent to MCP

**Decision**: JWT token in Authorization header → backend extracts user_id → injected into agent system prompt → passed to MCP tools

**Flow**:
1. Frontend sends JWT in `Authorization: Bearer <token>` header
2. Backend `verify_token()` extracts `user_id` from JWT (existing auth.py)
3. `user_id` is injected into the agent's system prompt
4. Agent automatically passes `user_id` to MCP tools (tools require it as first param)
5. MCP tools scope all DB queries by `user_id`

**Key insight**: The `user_id` in the URL path (`/api/{user_id}/chat`) must match
the `user_id` from the JWT token. The endpoint validates this match.

## Research Topic 7: ChatKit Theming & UI Customization

**Decision**: Use ChatKit's built-in theming system

**Available theme options** (from TypeScript types):
```typescript
theme: {
  colorScheme: 'light' | 'dark',
  radius: 'pill' | 'round' | 'soft' | 'sharp',
  density: 'compact' | 'normal' | 'spacious',
  typography: { fontFamily: string, baseSize: number },
  color: {
    grayscale: string,  // Grayscale palette base
    accent: string,     // Accent color
    surface: string,    // Surface color
  }
}
```

**Additional customization**:
- `header`: title, actions
- `startScreen`: greeting text, suggested prompts
- `composer`: placeholder text
- `disclaimer`: legal/info text
- `threadItemActions`: feedback, retry buttons

**Events for tool call visualization**:
- `chatkit.response.start` / `chatkit.response.end`: Loading indicators
- `chatkit.tool.change`: Tool selection changes
- `onClientTool`: Handler for client-side tool invocations
