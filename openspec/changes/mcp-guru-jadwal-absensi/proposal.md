## Why

Sistem manajemen sekolah ini memerlukan integrasi MCP (Model Context Protocol) untuk memungkinkan AI assistant mengakses data jadwal dan absensi secara terstruktur. Dengan MCP, guru dapat menggunakan AI untuk melihat jadwal mengajar dan mengelola absensi siswa melalui interface yang lebih natural dan terintegrasi.

## What Changes

- **New**: MCP Server implementation dengan protocol JSON-RPC 2.0
- **New**: MCP Tools untuk guru melihat jadwal mengajar (`guru_lihat_jadwal`)
- **New**: MCP Tools untuk guru mengabsen siswa (`guru_absen_siswa`)
- **New**: MCP Resources untuk data schedules dan attendances
- **New**: Authentication middleware untuk MCP connections
- **New**: Route `/mcp` untuk MCP server endpoint
- **New**: Service provider untuk MCP server registration

## Capabilities

### New Capabilities
- `mcp-server-core`: Core MCP server implementation dengan JSON-RPC 2.0 protocol, request handling, dan capability negotiation
- `mcp-guru-jadwal`: MCP tools untuk guru melihat jadwal mengajar - includes listing schedules, filtering by day, dan detail schedule dengan subject/classroom info
- `mcp-guru-absensi`: MCP tools untuk guru mengabsen siswa - includes marking attendance (hadir, sakit, izin, alpha), bulk attendance submission, dan attendance history retrieval
- `mcp-auth`: Authentication layer untuk MCP connections menggunakan existing Laravel auth system

### Modified Capabilities
- None

## Impact

**Affected Code:**
- New directory: `app/MCP/` - Core MCP server classes
- New directory: `app/MCP/Tools/` - Tool implementations
- New directory: `app/MCP/Resources/` - Resource handlers
- New controller: `app/Http/Controllers/McpController.php`
- Modified: `routes/web.php` - Add MCP endpoint route
- Modified: `bootstrap/providers.php` - Register MCP service provider

**APIs:**
- New endpoint: `POST /mcp` - MCP JSON-RPC endpoint

**Dependencies:**
- No new external dependencies - menggunakan Laravel built-in features

**Systems:**
- Integrates dengan existing Schedule, Attendance, User models
- Menggunakan existing authentication system (Laravel Sanctum/Session)
