# Codebase Structure

**Analysis Date:** 2026-02-04

## Directory Layout

```
[project-root]/
├── app/                      # Laravel application code
│   ├── Console/Commands/     # Artisan commands
│   ├── Http/
│   │   ├── Controllers/      # Request handlers
│   │   │   ├── Admin/        # Admin panel controllers
│   │   │   ├── Auth/         # Authentication controllers
│   │   │   ├── Guru/         # Teacher dashboard controllers
│   │   │   └── Teacher/      # Teacher-specific controllers
│   │   ├── Middleware/       # HTTP middleware
│   │   └── Requests/         # Form request validators
│   ├── Models/               # Eloquent models
│   ├── Providers/            # Service providers
│   └── Services/             # Business logic services
├── bootstrap/                # Application bootstrapping
│   ├── cache/                # Cached bootstrap files
│   └── ssr/                  # SSR build output
├── config/                   # Configuration files
├── database/
│   ├── factories/            # Model factories
│   ├── migrations/           # Database migrations
│   └── seeders/              # Database seeders
├── docs/                     # Documentation
├── import/                   # Import data files
├── openspec/                 # OpenSpec workflow files
│   ├── changes/              # Active changes
│   └── specs/                # Specifications
├── public/                   # Web server document root
│   ├── assets/               # Static assets
│   └── build/                # Vite build output
├── resources/
│   ├── css/                  # Stylesheets
│   ├── js/                   # React/TypeScript source
│   │   ├── Components/
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── Jadwal/       # Schedule components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── data/             # Mock data
│   │   ├── Layouts/          # Page layouts
│   │   ├── lib/              # Utility functions
│   │   └── Pages/            # Inertia page components
│   │       ├── Admin/        # Admin pages
│   │       ├── Auth/         # Auth pages
│   │       ├── Guru/         # Teacher pages
│   │       ├── Profile/      # Profile pages
│   │       └── Teacher/      # Teacher attendance pages
│   └── views/                # Blade templates
│       └── app.blade.php     # Main Inertia layout
├── routes/
│   ├── web.php               # Web routes
│   ├── auth.php              # Auth routes
│   └── console.php           # Console routes
├── storage/                  # Application storage
├── tests/
│   ├── Feature/              # Feature tests
│   └── Unit/                 # Unit tests
├── _bmad/                    # BMAD workflow configuration
├── _bmad-output/             # BMAD generated artifacts
└── .planning/                # GSD planning documents
    └── codebase/             # This directory
```

## Directory Purposes

**app/Http/Controllers/Admin/:**
- Purpose: Admin panel functionality
- Contains: UserController, ClassroomController, ScheduleController, SubjectController, AttendanceController, DashboardController, SettingController
- Key files: `app/Http/Controllers/Admin/DashboardController.php`

**app/Http/Controllers/Auth/:**
- Purpose: Authentication flows
- Contains: Login, register, password reset, email verification, QR login controllers
- Key files: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

**app/Http/Controllers/Guru/:**
- Purpose: Teacher dashboard features
- Contains: DashboardController, ScheduleController, ProfileController
- Key files: `app/Http/Controllers/Guru/DashboardController.php`

**app/Models/:**
- Purpose: Database models and relationships
- Contains: User, Classroom, Schedule, Subject, Attendance, School, Journal
- Key files: `app/Models/User.php`

**resources/js/Pages/Admin/:**
- Purpose: Admin panel React pages
- Contains: Dashboard, User management, Class management, Schedule, Reports, Settings, and placeholder pages
- Key files: `resources/js/Pages/Admin/Dashboard.tsx`

**resources/js/Components/ui/:**
- Purpose: shadcn/ui component library
- Contains: Button, Card, Dialog, Form, Input, Table, etc.
- Pattern: Each component is self-contained with TypeScript types

**resources/js/Layouts/:**
- Purpose: Page layout wrappers
- Contains: AdminLayout, AuthenticatedLayout, GuestLayout, TeacherLayout
- Key files: `resources/js/Layouts/AdminLayout.tsx`

**database/migrations/:**
- Purpose: Database schema evolution
- Contains: User tables, classroom tables, schedule tables, attendance tables, school settings
- Key files: Migration files with timestamps

## Key File Locations

**Entry Points:**
- `routes/web.php`: Main web routes
- `resources/js/app.tsx`: React application entry
- `resources/views/app.blade.php`: Blade layout with Inertia directives
- `bootstrap/app.php`: Laravel application bootstrap

**Configuration:**
- `vite.config.js`: Vite build configuration with PWA plugin
- `tailwind.config.js`: Tailwind CSS theme configuration
- `composer.json`: PHP dependencies
- `package.json`: Node.js dependencies
- `phpunit.xml`: Test configuration

**Core Logic:**
- `app/Http/Middleware/RoleMiddleware.php`: Role-based access control
- `app/Http/Middleware/HandleInertiaRequests.php`: Inertia shared data
- `app/Services/UserImportService.php`: Excel import logic

**Testing:**
- `tests/Feature/`: Feature tests for HTTP endpoints
- `tests/Unit/`: Unit tests for isolated logic
- `phpunit.xml`: PHPUnit configuration

## Naming Conventions

**Files:**
- Controllers: PascalCase + `Controller` suffix (e.g., `UserController.php`)
- Models: PascalCase singular (e.g., `User.php`, `Classroom.php`)
- Middleware: PascalCase (e.g., `RoleMiddleware.php`)
- Requests: PascalCase + `Request` suffix (e.g., `LoginRequest.php`)
- React Components: PascalCase (e.g., `Dashboard.tsx`, `AdminLayout.tsx`)
- Migrations: `YYYY_MM_DD_HHMMSS_descriptive_name.php`

**Directories:**
- Laravel: PascalCase (e.g., `Http/`, `Controllers/`)
- React: camelCase for feature folders (e.g., `admin/`, `Jadwal/`)
- Routes: lowercase with dots for names (e.g., `admin.dashboard`, `guru.jadwal`)

**Database:**
- Tables: plural snake_case (e.g., `users`, `classrooms`, `classroom_user`)
- Pivot tables: singular_model_singular_model (e.g., `classroom_user`, `subject_user`)
- Columns: snake_case (e.g., `identity_number`, `academic_year`)

## Where to Add New Code

**New Feature (Admin Module):**
- Controller: `app/Http/Controllers/Admin/[Feature]Controller.php`
- Routes: Add to `routes/web.php` within admin route group
- Page: `resources/js/Pages/Admin/[Feature]/Index.tsx`
- Tests: `tests/Feature/Admin[Feature]Test.php`

**New Component:**
- Admin-specific: `resources/js/Components/admin/[ComponentName].tsx`
- Reusable UI: `resources/js/Components/ui/[component-name].tsx` (follow shadcn pattern)
- Feature-specific: `resources/js/Components/[Feature]/[ComponentName].tsx`

**New Model:**
- Model: `app/Models/[ModelName].php`
- Migration: `database/migrations/YYYY_MM_DD_HHMMSS_create_[table_name]_table.php`
- Factory: `database/factories/[ModelName]Factory.php`
- Seeder: `database/seeders/[ModelName]Seeder.php`

**New Middleware:**
- File: `app/Http/Middleware/[MiddlewareName].php`
- Registration: Add to `bootstrap/app.php` in middleware section

**Utilities:**
- Shared helpers: `resources/js/lib/utils.ts` (existing utils)
- New utilities: Create `resources/js/lib/[utility].ts`

## Special Directories

**bootstrap/ssr/:**
- Purpose: Server-side rendering build output
- Generated: Yes (via `bun run build`)
- Committed: Yes (tracked in git)

**public/build/:**
- Purpose: Vite production build output
- Generated: Yes (via `bun run build`)
- Committed: Yes (tracked in git)

**storage/:**
- Purpose: Application-generated files (logs, cache, uploads)
- Generated: Runtime
- Committed: No (in .gitignore)

**vendor/:**
- Purpose: Composer dependencies
- Generated: Yes (via `composer install`)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: NPM dependencies
- Generated: Yes (via `npm install` or `bun install`)
- Committed: No (in .gitignore)

**openspec/:**
- Purpose: OpenSpec workflow management
- Contains: Change specifications, archived changes
- Generated: Manual workflow management
- Committed: Yes

**_bmad/:**
- Purpose: BMAD workflow configuration
- Contains: Manifests, config files
- Generated: BMAD tooling
- Committed: Yes

---

*Structure analysis: 2026-02-04*
