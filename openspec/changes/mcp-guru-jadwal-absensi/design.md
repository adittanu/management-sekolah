## Context

Sistem manajemen sekolah ini menggunakan Laravel 12 dengan Inertia.js v2 dan React. Laravel MCP package (`laravel/mcp` v0.5.3) sudah terinstall namun belum dikonfigurasi. Sistem memiliki model Schedule (jadwal) dan Attendance (absensi) yang sudah berfungsi melalui web interface.

Existing patterns:
- Role-based access control (admin, teacher, student)
- Teacher-specific controllers filter data by `Auth::id()`
- Attendance status: hadir, sakit, izin, alpha
- Schedule includes subject, classroom, teacher relationships

## Goals / Non-Goals

**Goals:**
- Implement MCP Server menggunakan Laravel MCP package
- Memungkinkan AI assistant mengakses jadwal guru secara terstruktur
- Memungkinkan AI assistant mengelola absensi siswa melalui MCP tools
- Menggunakan existing Laravel authentication system

**Non-Goals:**
- Tidak mengubah existing web interface
- Tidak menambahkan database schema baru
- Tidak mengimplementasikan MCP prompts (hanya tools)
- Tidak menggunakan custom MCP implementation (gunakan package)

## Decisions

### 1. MCP Server Implementation: Laravel MCP Package
**Decision:** Gunakan `laravel/mcp` package yang sudah terinstall
**Rationale:**
- Package official dari Laravel, maintained dan tested
- Sudah terinstall di project (v0.5.3)
- Mendukung tools, resources, dan prompts
- Built-in authentication support (Sanctum, OAuth 2.1, session)
- Testing utilities included (MCP Inspector, unit test helpers)

**Implementation approach:**
- Create MCP Server class extending `Laravel\Mcp\Server`
- Define tools dalam `$tools` array property
- Register server di `routes/ai.php`

### 2. Server Type: Web Server vs Local Server
**Decision:** Web Server dengan HTTP transport
**Rationale:**
- Web server cocok untuk Inertia.js application
- Dapat menggunakan existing session-based authentication
- Endpoint: `/mcp/guru` untuk guru-specific MCP server
- Laravel MCP menangani JSON-RPC protocol secara otomatis

### 3. Authentication: Session-based
**Decision:** Session-based authentication menggunakan existing Laravel auth
**Rationale:**
- Reuse existing authentication infrastructure
- User context tersedia via `$request->user()`
- Role-based filtering dapat dilakukan dalam tool handlers
- Tidak perlu API tokens

### 4. Tool Organization: Separate Tool Classes
**Decision:** Satu class per tool extending `Laravel\Mcp\Server\Tool`
**Rationale:**
- Follows Laravel MCP convention
- Setiap tool punya `handle()` method dengan dependency injection
- Input validation menggunakan `$schema` property
- Annotations untuk metadata (`#[IsReadOnly]`, `#[IsIdempotent]`)

**Tools to implement:**
- `LihatJadwalTool` - Melihat jadwal mengajar guru
- `LihatJadwalHariIniTool` - Melihat jadwal hari ini
- `AbsenSiswaTool` - Mengabsen siswa
- `LihatAbsensiTool` - Melihat data absensi

### 5. Response Format: Laravel MCP Response
**Decision:** Gunakan `Laravel\Mcp\Response` class
**Rationale:**
- `Response::text()` untuk text responses
- `Response::error()` untuk error handling
- Consistent dengan package conventions
- Built-in metadata support (`withMeta()`)

## Risks / Trade-offs

**[Risk] Package masih versi 0.x (beta)** → Mitigation: Monitor for breaking changes, pin version di composer.json

**[Risk] Limited documentation** → Mitigation: Use source code dan testing utilities untuk exploration

**[Risk] Performance overhead** → Mitigation: Implement caching dalam tool handlers jika diperlukan

**[Risk] Security exposure** → Mitigation: Strict middleware authentication, validate all inputs

## Migration Plan

**Deployment Steps:**
1. Publish MCP routes: `php artisan mcp:publish-routes` (jika belum)
2. Create MCP Server class
3. Create Tool classes
4. Register server di `routes/ai.php`
5. Test dengan MCP Inspector: `php artisan mcp:inspector guru`
6. Deploy ke production

**Rollback Strategy:**
- Hapus atau comment route di `routes/ai.php`
- Tidak ada database migration

## Open Questions

1. Apakah perlu implement MCP resources untuk readonly data?
   → Decision: Tools only untuk fase pertama, lebih simple

2. Bagaimana dengan rate limiting?
   → Decision: Gunakan Laravel rate limiting middleware pada MCP route
