# Codebase Concerns

**Analysis Date:** 2025-02-04

## Tech Debt

### 1. Mock Data in Production Pages
- **Issue:** Multiple admin pages contain hard-coded mock data instead of connecting to real backend APIs
- **Files:**
  - `resources/js/Pages/Admin/LMS/Index.tsx` (lines 64-92, 97-172) - Mock courses, sections, activities
  - `resources/js/Pages/Admin/Keuangan/Index.tsx` (lines 17-35) - Mock stats, transactions, arrears
  - `resources/js/Pages/Admin/Chat/Index.tsx` - Mock chat messages
  - `resources/js/Pages/Admin/PPDB/Index.tsx` - Mock PPDB data
  - `resources/js/Pages/Admin/Perpustakaan/Index.tsx` - Mock library data
  - `resources/js/Pages/Admin/Sarpras/Index.tsx` - Mock facility data
  - `resources/js/Pages/Admin/Ekskul/Index.tsx` - Mock extracurricular data
  - `resources/js/Pages/Admin/PKL/Index.tsx` - Mock internship data
  - `resources/js/Pages/Admin/Daring/Index.tsx` - Mock online learning data
  - `resources/js/Pages/Admin/Lisensi/Index.tsx` - Mock license data
- **Impact:** Features appear functional in UI but have no real backend integration. Data is lost on page refresh.
- **Fix approach:** Create proper database migrations, models, controllers, and API endpoints for each module. Replace mock data with real data fetching.

### 2. Duplicate Attendance Controllers
- **Issue:** Two separate controllers handle attendance with similar logic
- **Files:**
  - `app/Http/Controllers/Admin/AttendanceController.php` (249 lines)
  - `app/Http/Controllers/Teacher/AttendanceController.php` (226 lines)
- **Impact:** Code duplication leads to maintenance burden. Bug fixes need to be applied in two places.
- **Fix approach:** Extract common logic into a shared service class or trait. Controllers should delegate to shared business logic.

### 3. Schema Design Issues
- **Issue:** Teacher attendance stored in `student_id` column of attendances table
- **Files:** `app/Http/Controllers/Admin/AttendanceController.php` (line 209), `app/Http/Controllers/Teacher/AttendanceController.php` (line 186)
- **Impact:** Misleading column name causes confusion. Query logic requires workarounds to exclude teacher records when counting student attendance.
- **Fix approach:** Rename column to `user_id` or create separate `teacher_attendances` table.

### 4. Manual Role Assignment Bypass
- **Issue:** Role field is guarded in User model but manually assigned in multiple places
- **Files:**
  - `app/Models/User.php` (line 24): `'role'` commented out from fillable
  - `app/Http/Controllers/Admin/UserController.php` (lines 52, 80): Manual `$user->role = $validated['role']`
  - `app/Services/UserImportService.php` (lines 89, 105, 142): Manual role assignment during import
- **Impact:** Inconsistent pattern. Risk of forgetting to set role when creating users through other channels.
- **Fix approach:** Either add role back to fillable with proper validation, or create dedicated methods like `makeAdmin()`, `makeTeacher()`, `makeStudent()`.

### 5. Large Component Files
- **Issue:** Several React components exceed 500 lines, indicating potential for decomposition
- **Files:**
  - `resources/js/Pages/Admin/Absensi/Index.tsx` (945 lines)
  - `resources/js/Pages/Admin/Jadwal/Index.tsx` (731 lines)
  - `resources/js/Pages/Admin/LMS/Index.tsx` (855+ lines)
  - `resources/js/Pages/Admin/Kelas/Show.tsx` (583 lines)
- **Impact:** Hard to maintain, test, and reason about. Violates single responsibility principle.
- **Fix approach:** Extract sub-components, custom hooks, and utility functions into separate files.

## Known Bugs

### 1. XSS Vulnerability in Pagination
- **Issue:** `dangerouslySetInnerHTML` used for pagination labels without sanitization
- **Files:**
  - `resources/js/Pages/Admin/Absensi/Index.tsx` (line 927)
  - `resources/js/Pages/Admin/User/Index.tsx` (line 366)
  - `resources/js/Pages/Admin/Mapel/Index.tsx` (line 445)
  - `resources/js/Pages/Teacher/Absensi/Index.tsx` (line 913)
- **Trigger:** If Laravel's pagination links contain malicious content, it will be rendered as HTML
- **Workaround:** Currently none. The code replaces `&laquo; Previous` with `<` and `Next &raquo;` with `>`.
- **Fix approach:** Use a safer approach - render pagination buttons manually or use a library that handles this securely.

### 2. QR Login Security Issue
- **Issue:** QR login uses identity_number as token without expiration
- **Files:** `app/Http/Controllers/Auth/QrLoginController.php` (lines 21-25)
- **Trigger:** Anyone with knowledge of a user's identity_number can generate a valid QR code and login
- **Workaround:** None in current implementation
- **Fix approach:** Implement time-limited, single-use tokens with proper encryption. Add rate limiting.

### 3. Login Bypass Route
- **Issue:** `/login-bypass` route allows direct login via email query parameter
- **Files:** `routes/web.php` (lines 154-173)
- **Trigger:** Accessing `/login-bypass?email=any@email.com` logs in as that user without password
- **Workaround:** None - this is a critical security hole
- **Fix approach:** Remove this route entirely or protect it with a secure token system for legitimate use cases.

### 4. Import Service Hardcoded Defaults
- **Issue:** UserImportService has hardcoded defaults and fragile parsing logic
- **Files:** `app/Services/UserImportService.php`
  - Line 104: Default password is hardcoded as 'password'
  - Lines 121, 137, 155: Academic year calculated as current year only
  - Lines 263-282: Classroom parsing assumes specific naming format (X-MAJOR-NUMBER)
- **Impact:** Security risk with default passwords. Academic year logic breaks after December. Classroom parsing fails for non-standard names.
- **Fix approach:** Remove default password - require password column in import. Make academic year configurable. Add validation for classroom name format.

## Security Considerations

### 1. APP_DEBUG Enabled in Production Risk
- **Risk:** Debug mode exposes sensitive information
- **Files:** `.env` (line 4): `APP_DEBUG=true`
- **Current mitigation:** None - this is the default local configuration
- **Recommendations:** Ensure `.env` on production has `APP_DEBUG=false`. Add environment-specific `.env.production` template.

### 2. No Rate Limiting on Authentication
- **Risk:** Brute force attacks possible on login endpoints
- **Files:** All auth controllers in `app/Http/Controllers/Auth/`
- **Current mitigation:** Laravel's default throttle middleware may be present but not explicitly configured
- **Recommendations:** Add explicit rate limiting in `RouteServiceProvider` or route definitions for auth endpoints.

### 3. File Upload Validation
- **Risk:** Journal proof_file upload accepts PDF but doesn't validate content
- **Files:** `app/Http/Controllers/Admin/AttendanceController.php` (line 181), `app/Http/Controllers/Teacher/AttendanceController.php` (line 157)
- **Current mitigation:** MIME type validation present (`mimes:jpg,jpeg,png,pdf`)
- **Recommendations:** Add file size limits, scan for malicious content, store files outside web root with proper access controls.

### 4. SQL Injection Risk in Search
- **Risk:** Raw search query interpolation in UserController
- **Files:** `app/Http/Controllers/Admin/UserController.php` (lines 20-22)
- **Current mitigation:** Laravel's query builder provides some protection
- **Recommendations:** Use parameterized queries explicitly or Laravel's `whereLike` scope if available.

## Performance Bottlenecks

### 1. N+1 Query Issues
- **Problem:** Multiple queries in loops for attendance statistics
- **Files:**
  - `app/Http/Controllers/Admin/AttendanceController.php` (lines 49-53, 118-150)
  - `app/Http/Controllers/Teacher/AttendanceController.php` (lines 50-54, 96-129)
- **Cause:** Querying attendances for each schedule/journal individually
- **Improvement path:** Use eager loading with `with()` and aggregate queries with `groupBy` to fetch all statistics in single queries.

### 2. Large Dataset Loading
- **Problem:** User import loads entire spreadsheet into memory
- **Files:** `app/Services/UserImportService.php` (line 52): `$sheet->toArray()`
- **Cause:** Large Excel files can exhaust PHP memory limit
- **Improvement path:** Use chunk reading with `PhpSpreadsheet`'s chunk filter or process row-by-row with a generator.

### 3. Client-Side Data Transformation
- **Problem:** Heavy data transformation happening on every render in React components
- **Files:** `resources/js/Pages/Admin/Jadwal/Index.tsx` (lines 163-165): `useMemo` helps but still runs on data changes
- **Cause:** Transforming schedule data from API format to grid format in component
- **Improvement path:** Transform data in backend controller or use a more efficient data structure.

## Fragile Areas

### 1. Attendance Statistics Logic
- **Files:** `app/Http/Controllers/Admin/AttendanceController.php` (lines 55-106)
- **Why fragile:** Complex logic to distinguish teacher vs student attendance using ID comparisons. Relies on `student_id` column containing both student and teacher IDs.
- **Safe modification:** Add explicit `user_type` column or separate tables before modifying attendance logic.
- **Test coverage:** Limited - only basic feature tests exist.

### 2. Schedule Drag-and-Drop
- **Files:** `resources/js/Pages/Admin/Jadwal/Index.tsx` (lines 270-365)
- **Why fragile:** Optimistic UI updates before API confirmation. Complex state management for drag operations.
- **Safe modification:** Always test both success and error scenarios. Ensure state reversion works correctly.
- **Test coverage:** No automated tests for drag-and-drop functionality.

### 3. User Import Column Mapping
- **Files:** `app/Services/UserImportService.php` (lines 182-216)
- **Why fragile:** Relies on specific column names and positions. Manual mapping fallback may not work for all file formats.
- **Safe modification:** Add comprehensive validation and clear error messages for mapping failures.
- **Test coverage:** No dedicated tests for import service.

### 4. Day Name Localization
- **Files:** Multiple controllers use hardcoded Indonesian day names
- **Why fragile:** `Carbon::now()->locale('id')->isoFormat('dddd')` may fail if Indonesian locale not installed
- **Safe modification:** Add fallback logic or use English day names internally with translation for display.

## Scaling Limits

### 1. SQLite Database
- **Current capacity:** Single-file database
- **Limit:** Concurrent write operations will bottleneck. File size limits on some systems.
- **Scaling path:** Migrate to PostgreSQL or MySQL for production. SQLite is fine for development/small deployments.

### 2. File Storage
- **Current:** Local filesystem (`storage/app/public`)
- **Limit:** Single server storage. No CDN for static assets.
- **Scaling path:** Implement S3-compatible storage (AWS S3, MinIO, DigitalOcean Spaces) for file uploads.

### 3. Session Storage
- **Current:** Database sessions (`SESSION_DRIVER=database`)
- **Limit:** Database bottleneck with high concurrent users
- **Scaling path:** Migrate to Redis for session storage when scaling beyond single server.

## Dependencies at Risk

### 1. @dnd-kit for Drag-and-Drop
- **Risk:** Heavy dependency for single feature (schedule management)
- **Impact:** Bundle size increase. Complex API may break on updates.
- **Migration plan:** Evaluate lighter alternatives or native HTML5 drag-and-drop if feature requirements allow.

### 2. PhpSpreadsheet
- **Risk:** Memory-intensive library for Excel import
- **Impact:** High memory usage on large imports
- **Migration plan:** Consider streaming parsers like `box/spout` for large file processing.

## Missing Critical Features

### 1. No Real-time Updates
- **Problem:** Attendance dashboard doesn't update in real-time when teachers submit attendance
- **Blocks:** Live monitoring of school attendance status
- **Priority:** Medium

### 2. No Audit Logging
- **Problem:** No tracking of who changed what data and when
- **Blocks:** Compliance requirements, debugging data issues
- **Priority:** High for production use

### 3. No Backup/Export System
- **Problem:** No automated backup or data export functionality
- **Blocks:** Disaster recovery, data portability
- **Priority:** High

### 4. No Email Notifications
- **Problem:** MAIL_MAILER=log means emails go to log file only
- **Blocks:** Password reset emails, notification system
- **Priority:** Medium

## Test Coverage Gaps

### 1. Frontend Tests
- **What's not tested:** All React components have no automated tests
- **Files:** All files in `resources/js/`
- **Risk:** UI regressions, broken user flows go undetected
- **Priority:** High

### 2. Service Layer Tests
- **What's not tested:** `UserImportService` has no unit tests
- **Files:** `app/Services/UserImportService.php`
- **Risk:** Import bugs affect data integrity
- **Priority:** High

### 3. API Integration Tests
- **What's not tested:** Most admin API endpoints lack feature tests
- **Files:** Only basic auth tests exist in `tests/Feature/`
- **Risk:** API changes break frontend
- **Priority:** Medium

### 4. Drag-and-Drop Tests
- **What's not tested:** Schedule drag-and-drop functionality
- **Files:** `resources/js/Pages/Admin/Jadwal/Index.tsx`
- **Risk:** Complex interaction bugs
- **Priority:** Low (manual testing acceptable for now)

---

*Concerns audit: 2025-02-04*
