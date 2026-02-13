---
id: 1
title: Update-constitution-for-Todo-app
stage: constitution
date: 2026-02-06
surface: agent
model: Claude Sonnet 4.5
feature: todo-fullstack-app
branch: main
user: default
command: /sp.constitution
labels: ["constitution", "spec-driven-development", "ui", "security"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests: []
outcome: Successfully updated the project constitution with specific principles for the Todo Full-Stack Web Application
evaluation: All specified principles were incorporated into the constitution with proper structure and governance
---

# Update constitution for Todo Full-Stack Web Application

## Prompt Text
/sp.constitution (Updated for the entire project, with UI focus)
/sp.constitution
Project: Todo Full-Stack Web Application (Phase II – Web + Auth)
Core principles:

Spec-driven development using Spec-Kit Plus + Claude Code (no manual coding outside agent workflow)
Multi-user isolation & strong security (JWT + user ownership enforcement)
Extremely polished, professional, and modern user interface
Delightful user experience: smooth animations, responsive across all devices, intuitive flow
Support for both light and dark themes (automatic system preference + manual toggle)
Accessibility: WCAG 2.1 AA compliant (contrast, keyboard nav, screen reader friendly)

Key standards:

UI/UX: Clean, minimal, premium feel – inspired by modern apps (Notion, Linear, Todoist, Superhuman)
Color system: Soft neutrals, accent colors (e.g., indigo/violet/blue), good contrast in both modes
Typography: System font stack + modern sans-serif (Inter, SF Pro, or Geist), generous spacing, hierarchy
Layout: Centered project name "Todo" or "MyTodo" in header, sidebar or top nav, main content centered/max-width ~1200px
Components: Shadcn/ui or Radix + Tailwind preferred (beautiful defaults, customizable)
Dark mode: Full support via next-themes or class-based, seamless switching
Animations: Subtle micro-interactions (framer-motion or tailwind animate) – fade-ins, scale on hover, slide-ins
All code must reference relevant specs (@specs/...)
Authentication: Better Auth + JWT everywhere, secure shared secret
Code quality: Type-safe (TS), modular, error boundaries, loading states

Constraints:

Stack: Next.js 16+ App Router, Tailwind CSS, Better Auth (JWT enabled), TypeScript
Monorepo: frontend/, backend/, specs/ as defined
No heavy libraries beyond shadcn/ui, lucide-react icons, framer-motion (if needed)
Environment: BETTER_AUTH_SECRET shared, DATABASE_URL for backend reference
API: All calls secured with Authorization: Bearer <token>

Success criteria:

Frontend looks professional & premium (users say "wow, this looks good")
Light & dark mode both beautiful and consistent
Project name prominently centered in header (e.g., large elegant text or logo-style)
Full CRUD + toggle complete works flawlessly with user isolation
Zero visual bugs on mobile/tablet/desktop
Smooth loading states, error messages, toast notifications
Feels fast and delightful to use

## Response Text
Successfully updated the project constitution at .specify/memory/constitution.md with all the specified principles, constraints, standards, and success criteria for the Todo Full-Stack Web Application project. The constitution now includes 6 core principles covering spec-driven development, security, UI/UX, user experience, accessibility, and code quality. It also includes sections for technology stack constraints, development standards, success criteria, and governance.