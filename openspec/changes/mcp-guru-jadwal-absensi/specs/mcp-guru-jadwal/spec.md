## ADDED Requirements

### Requirement: Guru dapat melihat jadwal mengajar via MCP tool
The system SHALL provide MCP tool `LihatJadwalTool` untuk teachers melihat assigned teaching schedules.

#### Scenario: List semua jadwal untuk guru yang login
- **WHEN** authenticated teacher invokes `lihat-jadwal` tool tanpa day parameter
- **THEN** `LihatJadwalTool::handle()` queries Schedule model
- **AND** filters by `teacher_id` = current authenticated user id
- **AND** loads relationships: subject, classroom
- **AND** returns Response::text dengan formatted schedule list

#### Scenario: Filter jadwal berdasarkan hari
- **WHEN** teacher invokes `lihat-jadwal` dengan `hari` parameter (e.g., "Senin")
- **THEN** tool validates `hari` against allowed values: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
- **AND** filters schedules where `day` = parameter value
- **AND** orders results by `start_time`
- **AND** returns filtered schedule list

#### Scenario: Tidak ada jadwal
- **WHEN** teacher has no assigned schedules
- **THEN** tool returns `Response::text("Anda belum memiliki jadwal mengajar.")`

### Requirement: Guru dapat melihat jadwal hari ini via MCP tool
The system SHALL provide MCP tool `LihatJadwalHariIniTool` untuk quick access ke today's schedule.

#### Scenario: Get jadwal hari ini
- **WHEN** teacher invokes `lihat-jadwal-hari-ini` tool
- **THEN** tool determines current day menggunakan Carbon dengan locale 'id'
- **AND** maps day name ke Indonesian format (Senin, Selasa, etc.)
- **AND** queries schedules for current teacher dan current day
- **AND** checks attendance status untuk setiap schedule (exists in attendances table for today)
- **AND** returns formatted response dengan schedule list dan attendance status

#### Scenario: Weekend access
- **WHEN** teacher invokes tool pada hari Minggu atau Sabtu
- **THEN** tool returns `Response::text("Hari ini adalah hari libur. Tidak ada jadwal mengajar.")`

#### Scenario: Attendance status indicator
- **WHEN** schedule list is returned
- **THEN** setiap schedule item includes indicator: "✓ Sudah absen" atau "○ Belum absen"
- **AND** based on existence of attendance records for that schedule and today's date

### Requirement: Tool menggunakan Laravel MCP Tool class
The system SHALL implement tools menggunakan Laravel MCP conventions.

#### Scenario: LihatJadwalTool extends Tool class
- **WHEN** `LihatJadwalTool` extends `Laravel\Mcp\Server\Tool`
- **THEN** tool defines `$description` property
- **AND** tool defines `$schema` property untuk input validation
- **AND** tool implements `handle(Request $request): Response` method
- **AND** tool annotated dengan `#[IsReadOnly]` karena tidak mengubah data

#### Scenario: Input schema validation
- **WHEN** tool defines `$schema` dengan properties
- **THEN** Laravel MCP validates input arguments against schema
- **AND** invalid arguments rejected before handle() dipanggil
- **AND** schema includes: `hari` (optional, enum of days)

#### Scenario: Response format
- **WHEN** tool returns data
- **THEN** menggunakan `Response::text()` dengan formatted string
- **AND** text includes readable schedule information
