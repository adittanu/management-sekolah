## 1. Setup & Configuration

- [x] 1.1 Publish MCP routes menggunakan `php artisan mcp:publish-routes`
- [x] 1.2 Verify `routes/ai.php` exists dan configured correctly
- [x] 1.3 Check MCP configuration di `config/mcp.php` (jika ada)

## 2. Create MCP Server

- [x] 2.1 Create `app/Mcp/Servers/GuruServer.php` extending `Laravel\Mcp\Server`
- [x] 2.2 Define `$tools` array dengan tool class names
- [x] 2.3 Register server di `routes/ai.php` dengan `Mcp::web('/mcp/guru', GuruServer::class)->middleware('auth')`

## 3. Create MCP Tools - Jadwal (Schedule)

- [x] 3.1 Create `app/Mcp/Tools/LihatJadwalTool.php`
  - Extend `Laravel\Mcp\Server\Tool`
  - Define `$description` dan `$schema` properties
  - Annotate dengan `#[IsReadOnly]`
  - Implement `handle(Request $request): Response` method
  - Query schedules filtered by authenticated teacher_id
  - Return `Response::text()` dengan formatted schedule list
  
- [x] 3.2 Create `app/Mcp/Tools/LihatJadwalHariIniTool.php`
  - Extend `Laravel\Mcp\Server\Tool`
  - Define `$description` dan `$schema`
  - Annotate dengan `#[IsReadOnly]`
  - Implement handle() dengan Carbon locale 'id'
  - Determine current day dan filter schedules
  - Check attendance status untuk setiap schedule
  - Return formatted response dengan attendance indicators

## 4. Create MCP Tools - Absensi (Attendance)

- [x] 4.1 Create `app/Mcp/Tools/AbsenSiswaTool.php`
  - Extend `Laravel\Mcp\Server\Tool`
  - Define `$description` dan `$schema` dengan properties: jadwal_id, siswa_id, tanggal, status
  - Annotate dengan `#[IsIdempotent]` (bukan `#[IsReadOnly]`)
  - Implement handle():
    - Validate teacher owns the schedule (schedule.teacher_id == user.id)
    - Validate status dalam [hadir, sakit, izin, alpha]
    - Validate tanggal <= today
    - Use `Attendance::updateOrCreate()` untuk record attendance
  - Return `Response::text("Absensi berhasil dicatat.")` atau error
  
- [x] 4.2 Create `app/Mcp/Tools/LihatAbsensiTool.php`
  - Extend `Laravel\Mcp\Server\Tool`
  - Define `$description` dan `$schema` dengan properties: jadwal_id, tanggal
  - Annotate dengan `#[IsReadOnly]` dan `#[IsIdempotent]`
  - Implement handle():
    - Query attendance records untuk schedule dan date
    - Load student relationships
    - Calculate statistics (hadir, sakit, izin, alpha counts)
    - Return formatted response dengan list dan statistics

## 5. Authorization & Security

- [x] 5.1 Implement role check dalam setiap tool handle() method
  - Check `$request->user()->role === 'teacher'`
  - Return `Response::error("Tool ini hanya untuk guru.")` jika bukan teacher
  
- [x] 5.2 Implement schedule ownership verification dalam AbsenSiswaTool
  - Query schedule dan verify teacher_id matches authenticated user
  - Return authorization error jika tidak match
  
- [x] 5.3 Add rate limiting pada MCP route
  - Apply `throttle:60,1` middleware pada route di `routes/ai.php`

## 6. Testing

- [x] 6.1 Test dengan MCP Inspector
  - Run `php artisan mcp:inspector guru`
  - Verify tools listed correctly
  - Test `lihat-jadwal` tool dengan authenticated user
  - Test `lihat-jadwal-hari-ini` tool
  - Test `absen-siswa` tool dengan valid data
  - Test `lihat-absensi` tool
  
- [x] 6.2 Create unit tests untuk tools
  - Create `tests/Feature/Mcp/GuruServerTest.php`
  - Use `GuruServer::actingAs($teacher)->tool(...)` pattern
  - Test happy paths dan error cases
  
- [x] 6.3 Test authorization
  - Verify unauthenticated requests rejected
  - Verify non-teacher users cannot access tools
  - Verify teachers cannot access other teachers' schedules

## 7. Documentation & Deployment

- [x] 7.1 Add PHPDoc comments pada semua tool classes
- [x] 7.2 Update README dengan MCP endpoint information
- [x] 7.3 Run `vendor/bin/pint` untuk code formatting
- [x] 7.4 Run tests: `php artisan test --compact tests/Feature/Mcp/`
- [x] 7.5 Deploy ke staging dan test end-to-end
