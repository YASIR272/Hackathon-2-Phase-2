# Data Model: Premium Frontend for Todo Application

## Core Entities

### User
Represents an authenticated user in the system

**Fields**:
- id: Unique identifier for the user
- email: Email address for authentication
- name: Display name for the user
- createdAt: Timestamp when user account was created
- updatedAt: Timestamp when user account was last updated
- themePreference: User's preferred theme (light, dark, system)

**Relationships**:
- Has many Tasks (user.tasks)

### Task
Represents a todo item belonging to a specific user

**Fields**:
- id: Unique identifier for the task
- title: Title of the task (required)
- description: Detailed description of the task (optional)
- completed: Boolean indicating completion status (default: false)
- userId: Foreign key linking to the owning user
- createdAt: Timestamp when task was created
- updatedAt: Timestamp when task was last updated

**State Transitions**:
- Active → Completed: When user marks task as complete
- Completed → Active: When user unmarks task as complete

**Validation Rules**:
- Title must be present and have minimum length
- Title must not exceed maximum character limit
- User ID must correspond to an existing user

## Frontend-Specific Data Structures

### ThemeState
Manages application theme state

**Fields**:
- mode: Current theme mode ('light', 'dark', 'system')
- systemPrefersDark: Whether system prefers dark mode
- forcedTheme: Override theme if user manually selects

### FormState
Manages form validation and submission state

**Fields**:
- isValid: Whether form meets all validation requirements
- errors: Collection of validation errors by field
- isSubmitting: Whether form is currently submitting
- submitSuccess: Whether last submission was successful

### APIResponse
Standardized API response structure

**Fields**:
- success: Whether the request was successful
- data: Returned data payload (optional)
- error: Error details if request failed (optional)
- message: Human-readable message (optional)

## Component Data Structures

### TaskCardProps
Properties for the task display component

**Fields**:
- task: The task object to display
- onToggleComplete: Callback function when completion status changes
- onEdit: Callback function when edit is requested
- onDelete: Callback function when delete is requested

### ThemeToggleProps
Properties for the theme switching component

**Fields**:
- currentTheme: The currently active theme
- onThemeChange: Callback when user changes theme preference