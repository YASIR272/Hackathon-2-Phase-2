// API Client with Better Auth integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private userId: string | null = null;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Set credentials from Better Auth session
  setCredentials(userId: string, token: string) {
    this.userId = userId;
    this.token = token;
    // Also store in localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify({ id: userId }));
      localStorage.setItem('authToken', token);
    }
  }

  // Get user ID - from instance, localStorage, or cookie
  private getUserId(): string {
    if (this.userId) return this.userId;

    if (typeof window !== 'undefined') {
      // Try localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id || user.userId || 'demo-user';
        } catch (e) {
          console.warn('Could not parse user from localStorage', e);
        }
      }
    }
    return 'demo-user'; // Fallback for demo purposes
  }

  // Get token - from instance, localStorage, or cookie
  private getToken(): string | null {
    if (this.token) return this.token;

    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const userId = this.getUserId();
    const token = this.getToken();

    // Replace {user_id} in endpoint with actual user ID
    const processedEndpoint = endpoint.replace('{user_id}', userId);
    const url = `${this.baseUrl}${processedEndpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty response body
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
