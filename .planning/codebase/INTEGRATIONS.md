# External Integrations

**Analysis Date:** 2025-02-04

## APIs & External Services

**No Third-Party APIs Detected:**
- No external API clients found in `composer.json` or `package.json`
- No API service imports in codebase (no Stripe, SendGrid, etc.)

**Internal QR Login:**
- Custom QR code authentication system
- Implementation: `app/Http/Controllers/Auth/QrLoginController.php`
- Frontend: `html5-qrcode` (scanning), `qrcode.react` (generation)

## Data Storage

**Databases:**
- **SQLite** (default)
  - Connection: `DB_CONNECTION=sqlite`
  - File: `database/database.sqlite`
  - Used for: Development and production (current setup)

- **MySQL/MariaDB** (supported)
  - Connection: `DB_CONNECTION=mysql` or `DB_CONNECTION=mariadb`
  - Config: `config/database.php`
  - Host, port, credentials via environment variables

- **PostgreSQL** (supported)
  - Connection: `DB_CONNECTION=pgsql`
  - Config: `config/database.php`

**File Storage:**
- **Local filesystem** (default)
  - Disk: `FILESYSTEM_DISK=local`
  - Storage location: `storage/app/`
  - Public storage: `storage/app/public/` (symlinked to `public/storage/`)

- **AWS S3** (optional)
  - Config: `config/filesystems.php`
  - Required env vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`
  - Currently not configured (empty values in `.env.example`)

**Caching:**
- **Database** (default)
  - Driver: `CACHE_STORE=database`
  - Uses `cache` table in database

- **Redis** (optional)
  - Config: `config/database.php`
  - Required env vars: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - Used for: Cache and queue if configured

**Session Storage:**
- **Database** (default)
  - Driver: `SESSION_DRIVER=database`
  - Uses `sessions` table

**Queue:**
- **Database** (default)
  - Driver: `QUEUE_CONNECTION=database`
  - Uses `jobs` table

## Authentication & Identity

**Auth Provider:**
- **Laravel Session-based Authentication** (custom)
  - Guard: `web` (session driver)
  - Provider: Eloquent (`App\Models\User`)
  - Implementation: `config/auth.php`

**Role-Based Access Control:**
- Custom role middleware: `app/Http/Middleware/RoleMiddleware.php`
- Roles: `admin`, `teacher`, `student`
- Role column on `users` table

**Password Reset:**
- Laravel built-in password reset
- Token storage: `password_reset_tokens` table
- Config: `config/auth.php` (passwords.users)

**Email Verification:**
- Laravel built-in email verification (commented out in User model)
- Can be enabled by implementing `MustVerifyEmail` interface

## Monitoring & Observability

**Error Tracking:**
- None configured
- Laravel's default exception handling in `bootstrap/app.php`

**Logs:**
- **Laravel Log** (default)
  - Channel: `LOG_CHANNEL=stack`
  - Stack: `LOG_STACK=single`
  - Level: `LOG_LEVEL=debug`

**Log Monitoring:**
- **Laravel Pail** (development)
  - Real-time log monitoring
  - Run via: `php artisan pail`
  - Included in `composer dev` script

## CI/CD & Deployment

**Hosting:**
- Not configured
- Laravel Herd mentioned in AGENTS.md for Windows development

**CI Pipeline:**
- None detected
- No GitHub Actions, GitLab CI, or other CI configs found

**Deployment:**
- Manual deployment expected
- Laravel deployment via standard PHP hosting

## Environment Configuration

**Required Environment Variables:**
```
APP_NAME              # Application name
APP_ENV               # Environment (local/production)
APP_KEY               # Encryption key (32 chars)
APP_DEBUG             # Debug mode (true/false)
APP_URL               # Application URL

DB_CONNECTION         # Database driver (sqlite/mysql/pgsql)
DB_DATABASE           # Database name/path

# For MySQL/PostgreSQL only:
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
```

**Optional Environment Variables:**
```
# AWS S3 Storage
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION
AWS_BUCKET

# Redis
REDIS_HOST
REDIS_PORT
REDIS_PASSWORD

# Mail
MAIL_MAILER
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM_ADDRESS

# Third-party services (not currently used)
POSTMARK_API_KEY
RESEND_API_KEY
SLACK_BOT_USER_OAUTH_TOKEN
```

**Secrets Location:**
- `.env` file (not committed to git)
- `.env.example` provides template (committed)
- Never commit `.env` with real credentials

## Webhooks & Callbacks

**Incoming:**
- None configured
- No webhook routes found in `routes/web.php`

**Outgoing:**
- None configured
- No external webhook calls found in codebase

## External Service Placeholders

**Planned/Stubbed Integrations:**
Based on route definitions in `routes/web.php`, the following are placeholder pages:
- Office/SSO integration (`/admin/office-frame`)
- LMS integration (`/admin/lms`)
- Keuangan/Finance (`/admin/keuangan`)
- Perpustakaan/Library (`/admin/perpustakaan`)
- PPDB (Student admission) (`/admin/ppdb`)
- Ekskul/Extracurricular (`/admin/ekskul`)
- PKL/Internship (`/admin/pkl`)
- Daring/Online learning (`/admin/daring`)
- Sarpras/Facilities (`/admin/sarpras`)
- Chat (`/admin/chat`)

These routes render Inertia pages but have no backend integrations configured.

## Bypass Login (External Integration)

**Login Bypass Route:**
- Route: `GET /login-bypass`
- Implementation: Inline closure in `routes/web.php`
- Purpose: External system integration for auto-login
- Security: Email-based lookup only (no token validation)
- Usage: `/login-bypass?email=user@example.com`

---

*Integration audit: 2025-02-04*
