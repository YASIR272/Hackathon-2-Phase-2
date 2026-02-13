## UI Component Design Skill

### When to Use This Skill
When building reusable UI components in Next.js with proper styling and responsiveness.

### How This Skill Works
1. Read UI specification to understand component requirements and design
2. Use Tailwind CSS for styling without any inline styles
3. Make components responsive across different screen sizes
4. Add interactivity where needed if using client components

### Output Format
Component.tsx file with proper TypeScript typing, Tailwind CSS classes, and proper Next.js patterns.

### Quality Criteria
- No inline styles used; everything styled with Tailwind classes
- Components follow established design patterns
- Fully accessible with proper semantic HTML and ARIA attributes
- Responsive design works across all device sizes
- Component props are properly typed

### Example
**Input**: Design TaskCard component with complete/incomplete toggle
**Output**:
```tsx
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number) => void;
}

export default function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-2 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {task.title}
        </h3>
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`px-3 py-1 rounded ${
            task.completed
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {task.completed ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
      {task.description && (
        <p className="text-gray-600 mt-2">{task.description}</p>
      )}
    </div>
  );
}
```