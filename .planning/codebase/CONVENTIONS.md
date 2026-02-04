# Coding Conventions

**Analysis Date:** 2026-02-04

## Naming Patterns

### PHP (Backend)

**Files:**
- Controllers: `PascalCaseController.php` (e.g., `UserController.php`, `DashboardController.php`)
- Models: `PascalCase.php` (e.g., `User.php`, `Classroom.php`)
- Requests: `PascalCaseRequest.php` (e.g., `LoginRequest.php`, `ImportUserRequest.php`)
- Services: `PascalCaseService.php` (e.g., `UserImportService.php`)
- Middleware: `PascalCaseMiddleware.php` (e.g., `RoleMiddleware.php`)

**Classes:**
- PSR-4 autoloading with `App\` namespace for application code
- Controllers extend `App\Http\Controllers\Controller`
- Models extend `Illuminate\Database\Eloquent\Model`
- FormRequests extend `Illuminate\Foundation\Http\FormRequest`

**Methods:**
- Controllers use RESTful resource methods: `index()`, `store()`, `show()`, `update()`, `destroy()`
- Helper methods use `camelCase()` (e.g., `isAdmin()`, `parseClassroomName()`)
- Model relationships use descriptive names: `classrooms()`, `subjects()`, `attendances()`

**Variables:**
- Local variables use `$camelCase`
- Class properties use `$camelCase`
- Database columns use `snake_case`

### TypeScript/React (Frontend)

**Files:**
- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `DataTable.tsx`)
- Pages: `PascalCase.tsx` in `Pages/` directory (e.g., `Index.tsx`, `Dashboard.tsx`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`, `bot.ts`)
- Types: `index.d.ts` for type definitions

**Components:**
- Function components with explicit return types preferred
- Props interfaces use `PascalCaseProps` (e.g., `ButtonProps`, `DataTableProps`)
- Generic components use TypeScript generics (e.g., `DataTable<T>`)

**Variables:**
- `camelCase` for variables and functions
- `SCREAMING_SNAKE_CASE` for constants (e.g., `ROLE_LABELS`)
- Types use `PascalCase`

## Code Style

### PHP

**Formatting:**
- Laravel Pint (`laravel/pint`) for code formatting
- Follows PSR-12 coding standards
- 4 spaces indentation
- Opening braces on same line for control structures

**Type Declarations:**
- Use strict typing with return type hints: `public function index(): void`
- Nullable types: `?string`, `?int`
- Array return types: `array<string, mixed>`
- Union types where appropriate: `string|int|null`

**DocBlocks:**
- Use for class properties and complex methods
- Include `@param` and `@return` annotations
- Model factories use `@use` annotations: `@use HasFactory<\Database\Factories\UserFactory>`

### TypeScript

**Formatting:**
- TypeScript compiler (`tsc`) for type checking
- No explicit Prettier/ESLint config detected
- 4 spaces indentation observed
- Semicolons required

**Type Safety:**
- Strict typing enabled (inferred from `tsconfig.json` presence)
- Explicit return types on functions
- Interface definitions for complex objects
- Use `type` keyword for type aliases

**React Patterns:**
- Functional components with hooks
- `React.forwardRef` for component ref forwarding
- `React.useState`, `React.useEffect`, `React.useMemo` for state and effects
- Destructuring props in component parameters

## Import Organization

### PHP

**Order:**
1. Native PHP imports (`namespace`, `use`)
2. Laravel framework imports
3. Third-party package imports
4. Application imports

**Example:**
```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
```

### TypeScript

**Order:**
1. React imports
2. Third-party library imports (Inertia, Radix, etc.)
3. Local component imports (`@/Components/`)
4. Local utility imports (`@/lib/`, `@/types/`)
5. Local data imports (`@/data/`)

**Path Aliases:**
- `@/` maps to `resources/js/`
- Used consistently for all local imports

**Example:**
```typescript
import { useState, useEffect, FormEventHandler } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import AdminLayout from '@/Layouts/AdminLayout';
import { DataTable, ColumnDef } from '@/Components/admin/DataTable';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';
```

## Error Handling

### PHP

**Patterns:**
- Form validation through FormRequest classes
- Validation rules in `rules()` method
- Custom error messages via `messages()` method when needed
- Redirect with errors: `return redirect()->back()->with('success', 'message')`
- Exception handling with try-catch for transactions

**Example:**
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
    ]);
    
    // ... processing
    
    return redirect()->back()->with('success', 'User created successfully.');
}
```

**Database Transactions:**
```php
DB::beginTransaction();
try {
    // ... operations
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    Log::error("Error: " . $e->getMessage());
}
```

### TypeScript/React

**Patterns:**
- Inertia form handling with `useForm` hook
- Error display via `InputError` component
- Form validation errors accessed via `errors` property from `useForm`

**Example:**
```typescript
const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
});

// In JSX:
<InputError message={errors.name} />
```

## Logging

**Framework:** Laravel Log facade

**Patterns:**
- Error logging in catch blocks: `Log::error("Message: " . $e->getMessage())`
- Include stack traces for debugging: `$e->getTraceAsString()`
- Service-level logging for import operations and background tasks

## Comments

**When to Comment:**
- Complex business logic (e.g., classroom parsing, role determination)
- Security-related code (e.g., master password logic)
- Workarounds or temporary fixes
- Database transaction boundaries

**Example:**
```php
// Master Password Logic
$masterPassword = 'Diklat2026!';

// F1: Removed from fillable for security
// protected $fillable = ['role'];
```

## Function Design

### PHP

**Size:**
- Controllers: Keep under 100 lines when possible
- Services: Single responsibility, extract complex logic
- Methods: 20-30 lines preferred

**Parameters:**
- Type-hint all parameters
- Use Request objects for form data
- Use route model binding: `public function update(Request $request, User $user)`

**Return Values:**
- Use return type hints
- Controllers return Inertia responses or redirects
- Services return arrays with status information

### TypeScript

**Size:**
- Components: Under 200 lines, extract sub-components if larger
- Utility functions: Under 50 lines

**Parameters:**
- Destructure props in function parameters
- Use interfaces for complex prop types
- Optional parameters with defaults

## Module Design

### PHP

**Exports:**
- One class per file
- Namespace matches directory structure
- PSR-4 autoloading

**Service Pattern:**
```php
namespace App\Services;

class UserImportService
{
    public function import($file, $mapping = []): array
    {
        // Implementation
    }
}
```

### TypeScript

**Exports:**
- Named exports for components: `export function ComponentName()`
- Default exports for page components: `export default function PageName()`
- Type exports: `export interface TypeName`

**Barrel Files:**
- Not used; import components directly from their files

## Security Conventions

**Password Handling:**
- Always hash passwords: `Hash::make($password)`
- Use model casts for automatic hashing: `'password' => 'hashed'`
- Master password pattern documented in `LoginRequest.php`

**Authorization:**
- Role-based access control via `RoleMiddleware`
- Explicit role checks: `isAdmin()`, `isTeacher()`, `isStudent()`
- Route-level middleware: `->middleware('role:admin')`

**Mass Assignment Protection:**
- Use `$fillable` arrays on models
- Guard sensitive fields (e.g., `role` is not fillable, set explicitly)

---

*Convention analysis: 2026-02-04*
