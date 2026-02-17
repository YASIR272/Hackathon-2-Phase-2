'use client';

import { useState, useRef, useEffect } from 'react';
import { BrandingHeader } from '@/components/header/branding-header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/simple-auth';
import { apiClient } from '@/lib/api';
import { Send, Loader2, MessageSquare, Wrench, Plus } from 'lucide-react';

interface ToolCall {
  tool_name: string;
  arguments: Record<string, unknown>;
  result: string;
}

interface ChatApiResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCall[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  'Add a task to buy groceries',
  'Show me all my tasks',
  "What's pending?",
  'Mark task 1 as complete',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Set credentials when user changes
  useEffect(() => {
    if (user) {
      const userId = user.id;
      const token = btoa(JSON.stringify({ userId, sub: userId, exp: Date.now() + 86400000 }));
      apiClient.setCredentials(userId, token);
    }
  }, [user]);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const userId = user?.id || 'demo-user';
      const token = localStorage.getItem('authToken');
      const API_BASE = 'https://yasirali22218-hackathon-ii-phase-ii.hf.space';

      const res = await fetch(`${API_BASE}/api/${userId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data: ChatApiResponse = await res.json();

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        toolCalls: data.tool_calls?.length > 0 ? data.tool_calls : undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BrandingHeader />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Task Assistant</h2>
          </div>
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Hi{user ? `, ${user.name || user.email}` : ''}! How can I help?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                I can add, list, update, complete, and delete tasks for you. Just ask in natural language!
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/20">
                    {msg.toolCalls.map((tc, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-xs opacity-70 mt-1"
                      >
                        <Wrench className="h-3 w-3" />
                        <span className="font-mono">{tc.tool_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 text-sm">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/40 px-4 py-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to manage your tasks..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
