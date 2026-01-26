# Development Guide - Management Sekolah

> **Generated:** 2026-01-26  
> **Project Type:** Laravel 12 + React 18 (Inertia.js)

---

## Prerequisites

Pastikan sistem Anda memiliki:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| PHP | ^8.2 | `php -v` |
| Composer | Latest | `composer -V` |
| Node.js | ^18.x | `node -v` |
| NPM | ^9.x | `npm -v` |

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd management-sekolah
```

### 2. Quick Setup (Recommended)

Gunakan composer script untuk setup otomatis:

```bash
composer setup
```

Script ini akan menjalankan:
- `composer install` - Install PHP dependencies
- Copy `.env.example` ke `.env`
- `php artisan key:generate` - Generate application key
- `php artisan migrate --force` - Run database migrations
- `npm install` - Install Node.js dependencies
- `npm run build` - Build frontend assets

### 3. Manual Setup (Alternative)

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Install Node.js dependencies
npm install

# Build frontend assets
npm run build
```

---

## Environment Configuration

Edit file `.env` sesuai kebutuhan:

```env
# Application
APP_NAME="Management Sekolah"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Database (default: SQLite)
DB_CONNECTION=sqlite

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### Database Options

**SQLite (Default - Development):**
```env
DB_CONNECTION=sqlite
```

**MySQL (Production):**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=management_sekolah
DB_USERNAME=root
DB_PASSWORD=
```

---

## Running the Application

### Development Mode (Recommended)

Jalankan semua services secara bersamaan:

```bash
composer dev
```

Ini akan menjalankan secara paralel:
- 🌐 **Laravel Server** (`php artisan serve`) - http://localhost:8000
- 📮 **Queue Worker** (`php artisan queue:listen`)
- 📋 **Log Viewer** (`php artisan pail`)
- ⚡ **Vite Dev Server** (`npm run dev`) - HMR enabled

### Manual Start (Alternative)

Terminal 1 - Laravel Server:
```bash
php artisan serve
```

Terminal 2 - Vite (Hot Reload):
```bash
npm run dev
```

### Access URLs

| Service | URL |
|---------|-----|
| Application | http://localhost:8000 |
| Vite HMR | http://localhost:5173 |

---

## Build Commands

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Ini akan menjalankan:
- TypeScript compilation (`tsc`)
- Vite build untuk client
- Vite build untuk SSR

---

## Testing

### Run All Tests

```bash
composer test
```

Atau manual:

```bash
php artisan config:clear
php artisan test
```

### Run Specific Tests

```bash
# Feature tests only
php artisan test --testsuite=Feature

# Unit tests only
php artisan test --testsuite=Unit

# Specific test file
php artisan test tests/Feature/ProfileTest.php

# With coverage
php artisan test --coverage
```

### Test Structure

```
tests/
├── Feature/          # Integration/feature tests
│   ├── Auth/         # Authentication tests
│   ├── ProfileTest.php
│   └── ExampleTest.php
└── Unit/             # Unit tests
    └── ExampleTest.php
```

---

## Artisan Commands

### Database

```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh migration (drop all & re-migrate)
php artisan migrate:fresh

# Seed database
php artisan db:seed

# Fresh + seed
php artisan migrate:fresh --seed
```

### Cache

```bash
# Clear all caches
php artisan optimize:clear

# Clear specific caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### Development

```bash
# Generate model with migration
php artisan make:model ModelName -m

# Generate controller
php artisan make:controller ControllerName

# Generate request validation
php artisan make:request RequestName

# List all routes
php artisan route:list
```

---

## Frontend Development

### Adding shadcn/ui Components

```bash
# Add new component
npx shadcn@latest add <component-name>

# Example: Add toast component
npx shadcn@latest add toast
```

### Path Aliases (tsconfig.json)

```typescript
// Import from components
import { Button } from '@/Components/ui/button';

// Import from lib
import { cn } from '@/lib/utils';

// Import Ziggy routes
import { route } from 'ziggy-js';
```

### Creating New Pages

1. Buat file di `resources/js/Pages/`:
```tsx
// resources/js/Pages/Admin/NewModule/Index.tsx
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index() {
    return (
        <AdminLayout>
            {/* Content */}
        </AdminLayout>
    );
}
```

2. Tambahkan route di `routes/web.php`:
```php
Route::get('/admin/new-module', function () {
    return Inertia::render('Admin/NewModule/Index');
})->name('admin.new-module');
```

---

## Code Style & Conventions

### PHP (Laravel)

- **Formatter:** Laravel Pint
- **Run formatting:**
  ```bash
  ./vendor/bin/pint
  ```

### TypeScript/React

- **Strict mode:** Enabled
- **JSX:** react-jsx
- **Module:** ESNext

### CSS

- **Framework:** TailwindCSS
- **Component Library:** shadcn/ui (New York style)
- **Dark Mode:** Class-based (`darkMode: ['class']`)

---

## Troubleshooting

### Common Issues

**1. Vite not loading assets:**
```bash
npm run build
# or clear cache
php artisan optimize:clear
```

**2. Database errors:**
```bash
php artisan migrate:fresh
```

**3. Permission errors (storage):**
```bash
chmod -R 775 storage bootstrap/cache
```

**4. Composer autoload issues:**
```bash
composer dump-autoload
```

---

## Project Scripts Summary

| Command | Description |
|---------|-------------|
| `composer setup` | Full project setup |
| `composer dev` | Start all dev services |
| `composer test` | Run test suite |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
