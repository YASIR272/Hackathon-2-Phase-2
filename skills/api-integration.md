## API Integration Skill

### When to Use This Skill
When connecting frontend components to backend APIs or handling authentication tokens for secured endpoints.

### How This Skill Works
1. Define API client with proper configuration for the target backend
2. Attach JWT headers or other required authentication tokens
3. Handle responses and errors appropriately with proper error messages
4. Implement user data filtering by user_id for proper isolation

### Output Format
API client utility code (e.g., lib/api.ts) with proper TypeScript interfaces and error handling.

### Quality Criteria
- Secure header management with proper token handling
- Comprehensive error handling with user-friendly messages
- Proper user data isolation by filtering by user_id
- Type-safe API calls with proper validation

### Example
**Input**: Integrate GET tasks endpoint with authentication
**Output**:
```typescript
// API client for getting user tasks
export async function getTasks(): Promise<Task[]> {
  const token = await getToken();
  const response = await fetch('/api/tasks', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
}
```