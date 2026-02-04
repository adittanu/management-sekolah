## ADDED Requirements

### Requirement: MCP connections menggunakan Laravel authentication
The system SHALL menggunakan existing Laravel authentication untuk MCP connections.

#### Scenario: Authenticated user access via session
- **WHEN** MCP server route menggunakan `->middleware('auth')`
- **AND** authenticated user sends MCP request
- **THEN** Laravel auth middleware validates session
- **AND** server processes request dengan user context

#### Scenario: Unauthenticated user access rejected
- **WHEN** unauthenticated user sends MCP request
- **THEN** Laravel auth middleware returns 401 Unauthorized
- **AND** MCP request tidak mencapai server

### Requirement: MCP tools respect user roles
The system SHALL enforce role-based access control dalam tool handlers.

#### Scenario: Teacher role access
- **WHEN** user dengan `role === 'teacher'` invokes guru tools
- **THEN** tool processes request normally
- **AND** data difilter berdasarkan teacher_id

#### Scenario: Non-teacher role ditolak
- **WHEN** user dengan role selain 'teacher' invokes guru tools
- **THEN** tool checks `$request->user()->role`
- **AND** returns `Response::error("Tool ini hanya untuk guru.")`

### Requirement: User context tersedia dalam tool handlers
The system SHALL make authenticated user information available via Laravel MCP Request.

#### Scenario: Access user dalam handle method
- **WHEN** tool implements `handle(Request $request)`
- **THEN** `$request->user()` returns authenticated User model
- **AND** tool dapat access: id, name, role, email, dll

#### Scenario: Filter data berdasarkan user
- **WHEN** tool queries database
- **THEN** menggunakan `$request->user()->id` untuk filter
- **AND** example: `Schedule::where('teacher_id', $request->user()->id)`

### Requirement: Authorization checks dalam tools
The system SHALL implement authorization logic dalam individual tools.

#### Scenario: Check schedule ownership
- **WHEN** tool menerima schedule_id parameter
- **THEN** tool verifies `$request->user()->id === $schedule->teacher_id`
- **AND** returns error jika tidak authorized

#### Scenario: Role check helper
- **WHEN** tool perlu verify teacher role
- **THEN** check `$request->user()->role === 'teacher'`
- **AND** atau gunakan method `$request->user()->isTeacher()`

### Requirement: Session management via Laravel
The system SHALL rely pada Laravel's built-in session management.

#### Scenario: Session persistence
- **WHEN** user authenticated via web interface
- **THEN** same session cookie digunakan untuk MCP requests
- **AND** user remains authenticated across multiple MCP calls

#### Scenario: Session expiration handling
- **WHEN** Laravel session expires
- **THEN** subsequent MCP requests return 401
- **AND** client must re-authenticate via web interface

### Requirement: Testing dengan authenticated user
The system SHALL support testing dengan user authentication.

#### Scenario: MCP Inspector dengan auth
- **WHEN** running `php artisan mcp:inspector guru`
- **AND** server menggunakan auth middleware
- **THEN** inspector perlu include session cookie atau token

#### Scenario: Unit test dengan actingAs
- **WHEN** writing tests untuk MCP tools
- **THEN** use `GuruServer::actingAs($teacher)->tool(...)`
- **AND** tool receives authenticated user context
