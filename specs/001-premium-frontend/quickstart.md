# Quickstart Guide: Premium Frontend for Todo Application

## Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Initial Setup
1. Navigate to the frontend directory: `cd frontend/`
2. Install dependencies: `npm install` or `yarn install`
3. Create a `.env.local` file with required environment variables:
   ```
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=your-secret-key-here
   BACKEND_API_URL=http://localhost:8000
   ```

### Running the Application
1. Start the development server: `npm run dev` or `yarn dev`
2. Open the application in your browser at `http://localhost:3000`
3. The app will automatically reload when you make changes

## Key Features Walkthrough

### Authentication Flow
1. Visit the `/signup` page to create a new account
2. Use the `/signin` page to log in with existing credentials
3. After authentication, users are redirected to the dashboard
4. JWT tokens are managed automatically by Better Auth

### Task Management
1. Access the task dashboard at `/dashboard`
2. Use the "Add Task" button to create new tasks
3. Toggle task completion with the checkbox
4. Edit or delete tasks using the respective action buttons

### Theme Switching
1. Locate the theme toggle button in the header (sun/moon icon)
2. Click to cycle between light mode, dark mode, and system preference
3. Theme preference is saved between sessions

## Component Library Usage

### Using Pre-built Components
All shadcn/ui components are available in `components/ui/`:
- Import any component: `import { Button } from "@/components/ui/button"`
- Use with Tailwind classes for customization
- Components follow accessibility best practices

### Custom Components
- Branding header: `BrandingHeader` displays centered project name
- Task cards: `TaskCard` displays individual task items
- Theme toggle: `ThemeToggle` switches between light/dark modes
- Form components: Pre-styled forms with validation

## API Integration

### Making API Calls
1. Import the API client: `import { apiClient } from '@/lib/api'`
2. Use the client for authenticated requests:
   ```javascript
   const tasks = await apiClient.get('/tasks');
   const newTask = await apiClient.post('/tasks', { title: 'New task' });
   ```
3. Authentication tokens are attached automatically

### Handling Responses
- Successful responses return data in the `data` field
- Error responses include details in the `error` field
- Use the `Toast` component to display user feedback

## Styling Guidelines

### Tailwind CSS Usage
- Apply consistently sized padding: `p-4`, `py-2`, `px-3`
- Use rounded corners: `rounded-lg` for most elements
- Apply subtle shadows: `shadow-sm` to `shadow-md`
- Use accent colors for primary actions: `bg-primary`, `text-primary`

### Dark Mode Support
- Use Tailwind's dark mode variants: `dark:bg-gray-800`
- Maintain proper contrast ratios for accessibility
- Ensure all UI elements look good in both themes

## Testing the Application

### Visual Regression Checks
1. Verify appearance in both light and dark modes
2. Test on mobile, tablet, and desktop screen sizes
3. Ensure all interactive elements have proper hover/focus states

### Functional Testing
1. Complete end-to-end flow: signup → login → create task → toggle → delete → logout
2. Verify all form validations work correctly
3. Test theme switching functionality
4. Check responsive behavior on different screen sizes

### Accessibility Testing
1. Verify keyboard navigation works throughout the app
2. Test with screen readers if possible
3. Confirm proper ARIA attributes are in place
4. Check color contrast ratios meet WCAG 2.1 AA standards