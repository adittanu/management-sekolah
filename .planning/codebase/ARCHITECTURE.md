# Architecture

**Analysis Date:** 2026-02-04

## Pattern Overview

**Overall:** Laravel 12 + React SPA with Inertia.js

**Key Characteristics:**
- **Monolithic Full-Stack**: Single Laravel application serving both backend API and frontend React SPA
- **Role-Based Access Control**: Three distinct user roles (admin, teacher, student) with middleware-based protection
- **Inertia.js Bridge**: Server-side routing with client-side rendering, no separate API layer
- **PWA-Ready**: Service Worker registration and manifest configuration for offline capabilities
- **SSR Support**: Server-side rendering configured via Vite plugin

## Layers

**Routes Layer:**
- Purpose: Define URL endpoints and middleware groups
- Location: `routes/web.php`, `routes/auth.php`
- Contains: Route definitions, middleware assignments, Inertia page renders
- Depends on: Controllers, Middleware
- Used by: HTTP requests

**Middleware Layer:**
- Purpose: Request filtering, authentication, and data sharing
- Location: `app/Http/Middleware/`
- Contains: RoleMiddleware, HandleInertiaRequests
- Depends on: Models (User), Cache
- Used by: Routes

**Controllers Layer:**
- Purpose: Handle HTTP requests, orchestrate business logic
- Location: `app/Http/Controllers/`
- Contains: Admin controllers, Auth controllers, Teacher controllers
- Depends on: Models, Services, Requests
- Used by: Routes

**Models Layer:**
- Purpose: Database abstraction and relationships
- Location: `app/Models/`
- Contains: User, Classroom, Schedule, Subject, Attendance, School, Journal
- Depends on: Eloquent ORM
- Used by: Controllers, Services

**Services Layer:**
- Purpose: Business logic encapsulation
- Location: `app/Services/`
- Contains: UserImportService
- Depends on: Models, External libraries (PhpSpreadsheet)
- Used by: Controllers

**Requests Layer:**
- Purpose: Input validation and sanitization
- Location: `app/Http/Requests/`
- Contains: LoginRequest, ImportUserRequest, ProfileUpdateRequest
- Depends on: Laravel FormRequest
- Used by: Controllers

**Frontend Layer:**
- Purpose: React components and pages
- Location: `resources/js/`
- Contains: Pages, Components, Layouts, Hooks
- Depends on: Inertia.js, React, Tailwind, shadcn/ui
- Used by: Browser

## Data Flow

**Standard Page Request:**

1. **Request** → Laravel Router (`routes/web.php`)
2. **Middleware** → RoleMiddleware validates permissions
3. **Controller** → Fetches data from Models
4. **Inertia** → Serializes data and renders React page
5. **React** → Receives props via `usePage()` hook
6. **Component** → Renders UI with data

**Form Submission:**

1. **React Form** → Submit via Inertia `router.post()`
2. **Route** → Directs to Controller method
3. **Request** → Validation rules applied
4. **Controller** → Processes data, calls Services if needed
5. **Response** → Redirect with flash messages or JSON
6. **Frontend** → Flash messages displayed via Toaster

**State Management:**
- **Server State**: Managed via Inertia shared props (auth user, flash messages, school settings)
- **Client State**: React useState for local UI state
- **Persistent State**: localStorage for sidebar collapse preference

## Key Abstractions

**User Model with Role System:**
- Purpose: Central identity with role-based behavior
- Location: `app/Models/User.php`
- Pattern: Single table inheritance via `role` column
- Methods: `isAdmin()`, `isTeacher()`, `isStudent()`

**Inertia Shared Props:**
- Purpose: Global data available to all pages
- Location: `app/Http/Middleware/HandleInertiaRequests.php`
- Pattern: Middleware sharing via `share()` method
- Contents: auth.user, flash messages, ziggy routes, school_settings

**Role-Based Route Groups:**
- Purpose: Organize routes by user type
- Location: `routes/web.php`
- Pattern: Route prefix + middleware group
- Examples: `/admin/*`, `/guru/*`, `/siswa/*`

**Reusable UI Components:**
- Purpose: Consistent design system
- Location: `resources/js/Components/ui/`
- Pattern: shadcn/ui component library
- Examples: Button, Card, Dialog, Form components

## Entry Points

**Web Application:**
- Location: `routes/web.php`
- Triggers: HTTP requests
- Responsibilities: Route matching, middleware pipeline, controller dispatch

**React Application:**
- Location: `resources/js/app.tsx`
- Triggers: Page load (Inertia initializes)
- Responsibilities: Create React root, setup Inertia, render page components

**Console Commands:**
- Location: `routes/console.php`, `app/Console/Commands/`
- Triggers: Artisan CLI, scheduled tasks
- Responsibilities: Database maintenance, background jobs

**SSR Entry:**
- Location: `resources/js/ssr.tsx` (referenced in vite.config.js)
- Triggers: Server-side rendering requests
- Responsibilities: Hydrate React on server

## Error Handling

**Strategy:** Laravel exception handling with Inertia error pages

**Patterns:**
- Validation errors: Returned as Inertia props, displayed in forms
- Authorization failures: 403 abort in RoleMiddleware
- Flash messages: Success/error messages via session, displayed via Sonner Toaster

## Cross-Cutting Concerns

**Logging:** Laravel default logging to `storage/logs/`

**Validation:** FormRequest classes for input validation

**Authentication:** Laravel Sanctum + session-based auth

**Authorization:** RoleMiddleware for route-level protection

**Caching:** Laravel Cache for school settings (60-second TTL)

**Asset Building:** Vite with React plugin, PWA plugin, SSR support

---

*Architecture analysis: 2026-02-04*
