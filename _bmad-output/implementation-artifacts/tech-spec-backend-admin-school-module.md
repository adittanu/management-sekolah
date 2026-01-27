<file>
---
title: 'Backend Implementation for Admin School Module'
slug: 'backend-admin-school-module'
created: '2026-01-27'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4, 5]
tech_stack:
  - 'Laravel 11'
  - 'Inertia.js (React)'
  - 'MySQL'
  - 'PHP 8.2+'
files_to_modify:
  - 'database/migrations/*'
  - 'app/Models/User.php'
  - 'routes/web.php'
code_patterns:
  - 'Use FormRequests for validation (e.g., StoreUserRequest)'
  - 'Use Resource Controllers in App\Http\Controllers\Admin namespace'
  - 'Use Eloquent API Resources for data transformation'
  - 'Keep Indonesian naming for Routes (kelas, mapel) but English for Code (Classroom, Subject)'
test_patterns:
  - 'Pest/PHPUnit for Feature tests'
---

# Technical Specification: Backend Implementation for Admin School Module

## 1. Overview

### Problem Statement
The current project has a complete frontend (React/Inertia) for the School Admin Panel but lacks the corresponding backend infrastructure (Database Schema, Migrations, Models, and API/Controllers). The frontend components (`User`, `Kelas`, `Mapel`, `Jadwal`, `Absensi`) are currently using mock data or incomplete bindings.

### Solution
Implement a comprehensive backend layer including a normalized relational database schema, Laravel migrations, Eloquent models, and Controllers to support the existing visible Admin sidebar modules. The solution will reverse-engineer the data requirements from the existing UI components to ensure perfect compatibility, while addressing critical integrity and authorization requirements.

### Scope
**In Scope:**
-   **Database Schema & Migrations**:
    -   User Management: Add roles (Admin, Teacher, Student), identity numbers, and profile data via **new additive migration**.
    -   Classroom Management: Classes, Academic Years, and **pivot table for Student Enrollment**.
    -   Subject Management: Standardized codes and names.
    -   Scheduling System: Conflict logic checking both **Teacher availability** and **Classroom availability**.
    -   Attendance System: Bulk recording with constraints to prevent duplicates.
-   **Models & Relationships**: Eloquent relationships matching the schema with strict `onDelete` behaviors.
-   **Controllers/API**: Logic to serve data to Inertia pages and handle Form submissions.
-   **Authorization**: Basic Middleware/Policy to restrict Admin routes.

**Out of Scope:**
-   Frontend UI changes (unless critical for data binding).
-   Modules not visible in the current sidebar.
-   Complex reporting/analytics.
-   Teacher substitution logic (future phase).

## 2. Context for Development

### Codebase Patterns
-   **Routes**: Defined in `routes/web.php`. Currently use Indonesian segments (`/admin/kelas`).
-   **Controllers**: `App\Http\Controllers\Admin`.
-   **Models**: `App\Models`.
-   **Validation**: `FormRequest` classes required.
-   **Migration Strategy**: **Additive only**. Do not modify existing migration files to preserve backward compatibility.

### Files to Reference
| File Path | Description |
| :--- | :--- |
| `resources/js/Pages/Admin/User/Index.tsx` | UI for User Management |
| `resources/js/Pages/Admin/Kelas/Index.tsx` | UI for Classroom Management |
| `resources/js/Pages/Admin/Mapel/Index.tsx` | UI for Subjects |
| `routes/web.php` | Current route definitions |
| `app/Models/User.php` | Base User model |

### Technical Decisions
1.  **Role System**: Use ENUM `role` ('admin', 'teacher', 'student') on `users` table.
2.  **Naming Hybrid**: Routes in Indonesian, Code in English.
3.  **Student Enrollment**: Use `classroom_user` pivot table (Many-to-Many) to support history, even if current UI only shows active class.
4.  **Conflict Logic**: Strict check on (Teacher + Time) AND (Classroom + Time).
5.  **Identity Number**: Must be unique but nullable (for Admins).

## 3. Implementation Plan

### Phase 1: Core Database Schema (Migrations & Models)

- [x] Task 1: Create Additive User Migration
  - File: `database/migrations/xxxx_xx_xx_add_details_to_users_table.php`
  - Action: Add columns:
    - `role` (enum: 'admin', 'teacher', 'student') -> default 'student'
    - `identity_number` (string, unique, nullable)
    - `gender` (enum: 'L', 'P') -> nullable
    - `avatar` (string) -> nullable
  - File: `app/Models/User.php`
  - Action: Update `$fillable`, add `isTeacher()`, `isAdmin()`, `isStudent()` helpers.

- [x] Task 2: Create Master Data Migrations (Classrooms & Subjects)
  - File: `database/migrations/xxxx_xx_xx_create_classrooms_table.php`
  - Action: Table `classrooms`: `name` (string), `level` (enum: '10','11','12'), `major` (string), `academic_year` (string, e.g. "2025/2026"), `teacher_id` (foreignId -> users, onDelete set null).
  - File: `database/migrations/xxxx_xx_xx_create_subjects_table.php`
  - Action: Table `subjects`: `name` (string), `code` (string, unique), `category` (string).
  - File: `database/migrations/xxxx_xx_xx_create_classroom_user_table.php`
  - Action: Pivot table `classroom_user`: `classroom_id`, `user_id` (student), `is_active` (boolean default true).
  - File: `app/Models/Classroom.php`
  - Action: `belongsTo(User::class, 'teacher_id')`, `belongsToMany(User::class, 'students')`.

- [x] Task 3: Create Activity Migrations (Schedules & Attendances)
  - File: `database/migrations/xxxx_xx_xx_create_schedules_table.php`
  - Action: Table `schedules`: `subject_id` (foreignId, onDelete restrict), `classroom_id` (foreignId, onDelete cascade), `teacher_id` (foreignId, onDelete cascade), `day` (enum: 'Senin'...'Jumat'), `start_time` (time), `end_time` (time).
  - File: `database/migrations/xxxx_xx_xx_create_attendances_table.php`
  - Action: Table `attendances`: `schedule_id` (foreignId, onDelete cascade), `student_id` (foreignId), `date` (date), `status` (enum: 'hadir','sakit','izin','alpha').
  - Action: Add Unique Index: `(schedule_id, student_id, date)` to prevent duplicates.

### Phase 2: Controllers & Logic Implementation

- [x] Task 4: Implement Admin User Management with Authorization
  - File: `app/Http/Middleware/RoleMiddleware.php`
  - Action: Create middleware to check user role.
  - File: `app/Http/Controllers/Admin/UserController.php`
  - Action: CRUD. Validate `identity_number` uniqueness. Use `RoleMiddleware`.
  - File: `routes/web.php`
  - Action: Group admin routes under `middleware(['auth', 'role:admin'])`.

- [x] Task 5: Implement Classroom Management
  - File: `app/Http/Controllers/Admin/ClassroomController.php`
  - Action: CRUD. `show` method returns students via pivot.
  - File: `routes/web.php`
  - Action: Refactor `/admin/kelas`.

- [x] Task 6: Implement Schedule Management with Strict Conflict Check
  - File: `app/Http/Controllers/Admin/ScheduleController.php`
  - Action: CRUD.
  - Method `checkConflict($teacher_id, $classroom_id, $day, $start, $end)`:
    - Fail if Teacher busy at that time.
    - Fail if Classroom busy at that time.
  - File: `routes/web.php`
  - Action: Refactor `/admin/jadwal`.

- [x] Task 7: Implement Attendance Logic
  - File: `app/Http/Controllers/Admin/AttendanceController.php`
  - Action: `store` accepts array of `{student_id, status}`.
  - Logic: Validate `date` is not in future. Use `updateOrCreate` to handle re-submission safely.
  - File: `routes/web.php`
  - Action: Refactor `/admin/absensi`.

## 4. Acceptance Criteria

- [x] AC 1: Data Integrity
  - Given I delete a Subject, then any Schedule using it should block the deletion (Restrict).
  - Given I assign a Student to a Class, then they should appear in the Pivot table.

- [x] AC 2: Strict Conflict
  - Given Class 10A has Math on Mon 08:00, when I try to add Physics for Class 10A on Mon 08:00, then it should fail ("Classroom Conflict").
  - Given Teacher B teaches 10A on Mon 08:00, when I assign Teacher B to 11B on Mon 08:00, then it should fail ("Teacher Conflict").

- [x] AC 3: Authorization
  - Given I am a "Student" role, when I try to access `/admin/user`, then I should be forbidden (403) or redirected.

## 5. Additional Context
### Dependencies
- None (Uses standard Laravel features).

### Testing Strategy
- **Manual Testing**: Verify role access restrictions.
- **Seeding**: Create `DatabaseSeeder` with:
  - 1 Admin User.
  - Master Data: 10 Classrooms, 20 Subjects.
  - Enrollment: Distribute 100 dummy students into classes.
</file>
