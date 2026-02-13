# Premium Todo Frontend

A beautiful, modern todo application with premium UI/UX, light/dark mode support, and responsive design.

## Features

- 🎨 Beautiful, professional UI with premium feel
- 🌙 Light/dark mode with system preference detection
- 📱 Fully responsive design for mobile, tablet, and desktop
- 🔐 Secure authentication with JWT
- 🔄 Real-time task management with optimistic updates
- ✨ Smooth animations and transitions
- ♿ WCAG 2.1 AA compliant accessibility

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Better Auth](https://better-auth.com/) - Authentication
- [lucide-react](https://lucide.dev/) - Icons
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management
- [framer-motion](https://www.framer.com/motion/) - Animations
- [react-hook-form](https://react-hook-form.com/) - Form management
- [zod](https://zod.dev/) - Schema validation
- [sonner](https://github.com/emilkowalski/sonner) - Toast notifications

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables:
```bash
cp .env.example .env.local
```

3. Update the environment variables in `.env.local` with your configuration

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Commands

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
frontend/
├── app/                 # Next.js 13+ App Router pages
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── signin/          # Sign in page
│   ├── signup/          # Sign up page
│   └── dashboard/       # Dashboard page
├── components/          # Reusable React components
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Authentication components
│   ├── header/          # Header components
│   ├── task/            # Task-related components
│   └── theme/           # Theme-related components
├── lib/                 # Utilities and API client
│   ├── api.ts           # API client with JWT interceptors
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── providers/           # React context providers
└── public/              # Static assets
```

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the backend API
- `NEXTAUTH_URL`: NextAuth.js base URL
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `BETTER_AUTH_SECRET`: Better Auth secret key

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request