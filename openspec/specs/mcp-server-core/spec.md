## Purpose

MCP Server Core capability untuk sistem manajemen sekolah. Menyediakan infrastruktur MCP (Model Context Protocol) server menggunakan Laravel MCP package.

## Requirements

### Requirement: MCP Server menggunakan Laravel MCP package
The MCP server SHALL menggunakan `laravel/mcp` package yang sudah terinstall.

#### Scenario: Server extends Laravel MCP Server class
- **WHEN** MCP server class extends `Laravel\Mcp\Server`
- **THEN** server inherits JSON-RPC 2.0 protocol handling
- **AND** server supports automatic capability negotiation

#### Scenario: Server registers tools
- **WHEN** server defines `$tools` array dengan tool class names
- **THEN** tools are automatically registered and available via `tools/list`
- **AND** tools can be invoked via `tools/call`

### Requirement: MCP Server configured as Web Server
The MCP server SHALL didaftarkan sebagai web server dengan HTTP transport.

#### Scenario: Server registered in routes
- **WHEN** server didaftarkan di `routes/ai.php` menggunakan `Mcp::web()`
- **THEN** endpoint `/mcp/guru` tersedia untuk MCP requests
- **AND** server menggunakan existing Laravel request handling

#### Scenario: Server dengan authentication middleware
- **WHEN** server route menggunakan `->middleware('auth')`
- **THEN** hanya authenticated users dapat mengakses MCP endpoint
- **AND** user context tersedia dalam tool handlers via `$request->user()`

### Requirement: MCP Server provides tool discovery
The MCP server SHALL expose available tools via tools/list method.

#### Scenario: List guru-specific tools
- **WHEN** client calls `tools/list`
- **THEN** server returns array of tool definitions
- **AND** includes: lihat-jadwal, lihat-jadwal-hari-ini, absen-siswa, lihat-absensi
- **AND** setiap tool memiliki name, description, dan inputSchema

### Requirement: MCP Server handles tool invocation
The MCP server SHALL execute tools when called via tools/call method.

#### Scenario: Invoke lihat-jadwal tool
- **WHEN** client calls `tools/call` dengan name "lihat-jadwal"
- **THEN** `LihatJadwalTool::handle()` method dieksekusi
- **AND** tool menerima Request object dengan validated arguments
- **AND** tool returns Response dengan schedule data

#### Scenario: Tool dengan invalid arguments
- **WHEN** client calls tool dengan arguments yang tidak valid
- **THEN** Laravel MCP validates against `$schema` property
- **AND** returns validation error sebelum tool dieksekusi

### Requirement: MCP Server provides error handling
The MCP server SHALL return proper error responses untuk failures.

#### Scenario: Tool execution error
- **WHEN** tool throws exception during execution
- **THEN** server catches exception
- **AND** returns `Response::error()` dengan error message

#### Scenario: Unauthorized access
- **WHEN** unauthenticated user attempts to access MCP endpoint
- **THEN** Laravel auth middleware returns 401 Unauthorized
- **AND** MCP request tidak diproses
