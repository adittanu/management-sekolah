# AI Agent Instructions

## Critical Environment Rules
1. **PHP Execution**: This environment runs on Windows with Laravel Herd accessed via Git Bash.
   - **PROBLEM**: The `php` command is missing in Bash.
   - **SOLUTION**: ALWAYS use `php.bat` explicitly.
   - **Examples**:
     - `php.bat artisan list`
     - `php.bat -v`
     - `composer` (usually works, but if not, try `composer.bat`)

## Project Context
- **Framework**: Laravel 12
- **Frontend**: React + Inertia + Tailwind
- **Architecture**: BMAD (see `_bmad/` directory)
