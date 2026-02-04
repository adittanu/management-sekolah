## ADDED Requirements

### Requirement: Guru dapat mencatat absensi siswa via MCP tool
The system SHALL provide MCP tool `AbsenSiswaTool` untuk teachers mencatat student attendance.

#### Scenario: Mencatat absensi satu siswa
- **WHEN** authenticated teacher invokes `absen-siswa` tool dengan `jadwal_id`, `siswa_id`, `tanggal`, dan `status`
- **THEN** `AbsenSiswaTool::handle()` validates teacher owns the schedule
- **AND** validates `status` is one of: hadir, sakit, izin, alpha
- **AND** uses `Attendance::updateOrCreate()` untuk create or update record
- **AND** returns `Response::text("Absensi berhasil dicatat.")`

#### Scenario: Bulk absensi untuk seluruh kelas
- **WHEN** teacher invokes tool dengan `siswa` array (array of {siswa_id, status})
- **THEN** tool iterates through array dan catat setiap absensi
- **AND** menggunakan database transaction untuk atomicity
- **AND** returns summary: "X siswa hadir, Y sakit, Z izin, W alpha"

#### Scenario: Mencatat absensi diri sendiri (guru)
- **WHEN** teacher invokes tool dengan their own user_id sebagai siswa_id
- **THEN** system accepts dan catat sebagai teacher attendance
- **AND** same validation rules apply

### Requirement: Validasi status absensi
The system SHALL validate attendance status values menggunakan Laravel MCP schema.

#### Scenario: Valid status values
- **WHEN** tool `$schema` defines `status` property dengan enum: ["hadir", "sakit", "izin", "alpha"]
- **THEN** Laravel MCP validates input against schema
- **AND** invalid values rejected sebelum handle() dieksekusi

#### Scenario: Custom validation dalam tool
- **WHEN** additional validation needed beyond schema
- **THEN** tool performs validation dalam handle() method
- **AND** returns `Response::error("Status tidak valid. Pilih: hadir, sakit, izin, alpha.")` jika invalid

### Requirement: Validasi tanggal absensi
The system SHALL validate attendance dates.

#### Scenario: Tanggal tidak boleh di masa depan
- **WHEN** tool menerima `tanggal` parameter
- **THEN** tool validates `tanggal` <= today
- **AND** returns error jika tanggal di masa depan

#### Scenario: Format tanggal YYYY-MM-DD
- **WHEN** tool validates date format
- **THEN** accepts format: "2024-01-27"
- **AND** returns error dengan format instructions jika invalid

### Requirement: Authorization - guru hanya akses jadwal sendiri
The system SHALL verify teacher authorization sebelum mencatat absensi.

#### Scenario: Guru mencatat absensi untuk jadwal sendiri
- **WHEN** teacher invokes tool dengan `jadwal_id` they own
- **THEN** tool queries Schedule::where('id', $jadwal_id)->where('teacher_id', $user->id)->first()
- **AND** if found, proses absensi
- **AND** if not found, return `Response::error("Anda tidak memiliki akses ke jadwal ini.")`

#### Scenario: Guru mencoba akses jadwal guru lain
- **WHEN** teacher invokes tool dengan schedule_id not belonging to them
- **THEN** authorization check fails
- **AND** tool returns error response
- **AND** no attendance recorded

### Requirement: Guru dapat melihat data absensi via MCP tool
The system SHALL provide `LihatAbsensiTool` untuk view attendance records.

#### Scenario: Melihat absensi untuk jadwal dan tanggal tertentu
- **WHEN** teacher invokes `lihat-absensi` dengan `jadwal_id` dan `tanggal`
- **THEN** tool queries Attendance::where('schedule_id', $jadwal_id)->where('date', $tanggal)
- **AND** loads student relationship
- **AND** returns formatted list: nama siswa, NIS, status

#### Scenario: Melihat statistik absensi
- **WHEN** tool mengambil attendance data
- **THEN** calculate counts: hadir, sakit, izin, alpha
- **AND** format sebagai: "Total: X siswa | Hadir: Y | Sakit: Z | Izin: W | Alpha: V"

#### Scenario: Tidak ada data absensi
- **WHEN** no attendance records found untuk given criteria
- **THEN** tool returns `Response::text("Belum ada data absensi untuk jadwal ini.")`

### Requirement: Tool menggunakan Laravel MCP annotations
The system SHALL gunakan annotations untuk tool metadata.

#### Scenario: AbsenSiswaTool annotations
- **WHEN** `AbsenSiswaTool` annotated dengan `#[IsIdempotent]`
- **AND** NOT annotated dengan `#[IsReadOnly]` (karena modify data)
- **THEN** AI clients understand tool behavior
- **AND** can optimize tool invocation

#### Scenario: LihatAbsensiTool annotations
- **WHEN** `LihatAbsensiTool` annotated dengan `#[IsReadOnly]` dan `#[IsIdempotent]`
- **THEN** AI clients know tool tidak mengubah data
- **AND** dapat safely call multiple times
