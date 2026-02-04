# Technology Stack

**Analysis Date:** 2025-02-04

## Languages

**Primary:**
- **PHP 8.2+** - Backend logic, controllers, models, middleware (`app/`, `routes/`, `config/`)
- **TypeScript** - Frontend React components (`resources/js/**/*.tsx`)
- **CSS** - Tailwind CSS styling (`resources/css/`)

**Secondary:**
- **Blade** - Minimal view layer (`resources/views/app.blade.php` - root template only)

## Runtime

**Environment:**
- **PHP 8.2+** - Server runtime
- **Node.js** - Build tooling and frontend dev server

**Package Manager:**
- **Composer** (PHP) - `composer.json`, `composer.lock` present
- **npm/bun** (Node) - `package.json`, `package-lock.json` present

## Frameworks

**Core:**
- **Laravel 12** - PHP web framework (`composer.json` requires `laravel/framework: ^12.0`)
- **React 18.2.0** - Frontend UI library (`package.json`)
- **Inertia.js 2.0** - Laravel-React bridge (`inertiajs/inertia-laravel`, `@inertiajs/react`)
- **Tailwind CSS 3.2.1** - Utility-first CSS framework

**Authentication:**
- **Laravel Breeze** - Auth scaffolding (`laravel/breeze: ^2.3` in require-dev)
- **Laravel Sanctum 4.0** - API token authentication

**Testing:**
- **PHPUnit 11.5.3** - PHP unit testing (`phpunit.xml`)
- **Laravel Pail** - Log monitoring in dev (`laravel/pail: ^1.2.2`)

**Build/Dev:**
- **Vite 7.0.7** - Frontend build tool (`vite.config.js`)
- **Laravel Vite Plugin** - Vite-Laravel integration
- **TypeScript 5.0.2** - Type checking
- **Laravel Pint** - PHP code style (`laravel/pint: ^1.24`)

## Key Dependencies

**Critical Frontend:**
- `@inertiajs/react` ^2.0.0 - Inertia React adapter
- `@radix-ui/*` ^1.x - Headless UI components (dialog, dropdown, tabs, etc.)
- `react-hook-form` ^7.68.0 - Form management
- `zod` ^4.2.1 - Schema validation
- `@hookform/resolvers` ^5.2.2 - Form resolvers for Zod
- `lucide-react` ^0.561.0 - Icon library
- `recharts` ^3.6.0 - Data visualization
- `html5-qrcode` ^2.3.8 - QR code scanning
- `qrcode.react` ^4.2.0 - QR code generation
- `@dnd-kit/core` ^6.3.1 - Drag and drop
- `sonner` ^2.0.7 - Toast notifications
- `class-variance-authority` ^0.7.1 - Component variants
- `tailwind-merge` ^3.4.0 - Tailwind class merging
- `tailwindcss-animate` ^1.0.7 - Tailwind animations

**Critical Backend:**
- `inertiajs/inertia-laravel` ^2.0 - Inertia server-side adapter
- `tightenco/ziggy` ^2.0 - Laravel routes in JavaScript
- `phpoffice/phpspreadsheet` ^5.4 - Excel file handling (user import)
- `fakerphp/faker` ^1.23 - Test data generation

## Configuration

**Environment:**
- Configuration via `.env` file
- Example config: `.env.example`

**Key Environment Variables:**
- `APP_NAME` - Application name (default: "Laravel")
- `APP_ENV` - Environment (local/production)
- `APP_KEY` - Encryption key
- `APP_DEBUG` - Debug mode
- `APP_URL` - Application URL
- `DB_CONNECTION` - Database driver (default: sqlite)
- `DB_DATABASE` - Database path/name
- `SESSION_DRIVER` - Session storage (default: database)
- `CACHE_STORE` - Cache driver (default: database)
- `QUEUE_CONNECTION` - Queue driver (default: database)
- `MAIL_MAILER` - Mail driver (default: log)
- `AWS_*` - AWS credentials (optional)
- `REDIS_*` - Redis configuration (optional)

**Build:**
- `vite.config.js` - Vite configuration with PWA support
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
  - Path alias: `@/*` → `./resources/js/*`
  - Path alias: `ziggy-js` → `./vendor/tightenco/ziggy`

**Testing:**
- `phpunit.xml` - PHPUnit configuration
  - Tests in `tests/Unit` and `tests/Feature`
  - Source coverage: `app/` directory
  - Testing DB: SQLite in-memory (`:memory:`)

## Platform Requirements

**Development:**
- PHP 8.2 or higher
- Composer
- Node.js with npm or bun
- SQLite (default) or MySQL/MariaDB/PostgreSQL
- Git Bash (Windows environment)

**Production:**
- PHP 8.2+ with required extensions
- Web server (Nginx/Apache)
- Database server (SQLite/MySQL/PostgreSQL)
- Redis (optional, for cache/queues)

**Scripts:**
```bash
# Setup
composer setup          # Full project setup
composer dev            # Run dev server with concurrent processes
composer test           # Run tests
npm run build           # Build for production
npm run dev             # Start Vite dev server
```

## PWA Configuration

**Vite PWA Plugin:**
- App name: "Sekolah Kita"
- Description: "Aplikasi Manajemen Sekolah Terintegrasi"
- Icons: 192x192 and 512x512 PNG
- Display: standalone
- Auto-update enabled
- Workbox caching for static assets

---

*Stack analysis: 2025-02-04*
