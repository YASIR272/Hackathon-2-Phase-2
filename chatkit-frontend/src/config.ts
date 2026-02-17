/**
 * ChatKit Frontend Configuration
 *
 * API base URL, auth token retrieval, and ChatKit settings.
 */

// Backend API base URL — proxied through Vite in development
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Get auth token from localStorage (set by the Phase I/II frontend login flow)
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Get user ID from localStorage (set by the Phase I/II frontend login flow)
export function getUserId(): string {
  return localStorage.getItem("user_id") || "demo-user";
}

// Build the chat endpoint URL for the current user
export function getChatEndpoint(): string {
  const userId = getUserId();
  return `${API_BASE_URL}/api/${userId}/chat`;
}

// Build authorization headers
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
