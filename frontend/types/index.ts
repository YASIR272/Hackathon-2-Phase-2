// Define TypeScript types based on the data model

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  themePreference: 'light' | 'dark' | 'system';
};

export type Priority = 'low' | 'normal' | 'high';

export type TaskFilterStatus = 'all' | 'pending' | 'completed';

export type Task = {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  priority: Priority;
  dueDate?: string | null;
};

export type ThemeState = {
  mode: 'light' | 'dark' | 'system';
  systemPrefersDark: boolean;
  forcedTheme?: 'light' | 'dark';
};

export type FormState = {
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitSuccess: boolean;
};

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
  message?: string;
};

// Component Props Types
export type TaskCardProps = {
  task: Task;
  onToggleComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export type ThemeToggleProps = {
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
};