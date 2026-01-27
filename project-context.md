# Project Context & Agent Rules

## Environment & Tooling Quirk (CRITICAL)
- **PHP Command**: In this environment (Windows + Laravel Herd via Git Bash), the `php` command is NOT available directly. 
- **Rule**: ALWAYS use `php.bat` instead of `php` for all artisan and composer commands.
  - ✅ Correct: `php.bat artisan migrate`
  - ❌ Incorrect: `php artisan migrate`

## Project Stack
- Framework: Laravel 12.x
- PHP Version: 8.4.x (via Herd)
- Frontend: Inertia.js (React) + Tailwind CSS

## Important Notes
- This project uses BMAD architecture.
