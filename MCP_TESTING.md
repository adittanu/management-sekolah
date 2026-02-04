# Testing MCP Server

## Cara Test MCP Server

### 1. Test dengan curl (HTTP POST)

Karena MCP menggunakan JSON-RPC 2.0 via HTTP POST, Anda bisa test dengan curl:

```bash
# Test initialize request
curl -X POST https://management-sekolah.test/mcp/guru \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b "session_cookie=value" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'

# Test tools/list
curl -X POST https://management-sekolah.test/mcp/guru \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b "session_cookie=value" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'

# Test lihat-jadwal tool (perlu login sebagai guru)
curl -X POST https://management-sekolah.test/mcp/guru \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b "session_cookie=value" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "lihat-jadwal",
      "arguments": {}
    }
  }'
```

### 2. Test dengan MCP Inspector

Jalankan MCP Inspector di terminal terpisah:

```bash
php.bat artisan mcp:inspector mcp/guru
```

Kemudian buka browser ke URL yang ditampilkan (contoh: `http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=...`)

**Catatan:** MCP Inspector memerlukan autentikasi. Anda perlu:
1. Login ke aplikasi Laravel terlebih dahulu di browser
2. Copy session cookie
3. Paste ke MCP Inspector

### 3. Test dengan Playwright Browser Automation

Saya bisa bantu test dengan Playwright setelah Anda:
1. Jalankan MCP Inspector: `php.bat artisan mcp:inspector mcp/guru`
2. Beritahu saya URL yang muncul
3. Saya akan automate browser untuk test tools

### 4. Test dengan Unit Tests

```bash
php.bat artisan test tests/Feature/Mcp/GuruServerTest.php --compact
```

## Endpoint Info

- **MCP Endpoint:** `https://management-sekolah.test/mcp/guru`
- **Methods:** GET (info), POST (JSON-RPC)
- **Auth:** Session-based (Laravel auth)
- **Rate Limit:** 60 requests/minute

## Available Tools

1. `lihat-jadwal` - Melihat semua jadwal mengajar
2. `lihat-jadwal-hari-ini` - Melihat jadwal hari ini
3. `absen-siswa` - Mencatat absensi siswa
4. `lihat-absensi` - Melihat data absensi

## Troubleshooting

**Error 401 Unauthorized:**
- Pastikan sudah login sebagai guru di browser
- Copy session cookie ke request

**Error Connection Refused:**
- Pastikan Laravel Herd running
- Cek URL: `https://management-sekolah.test`

**MCP Inspector tidak bisa connect:**
- Pastikan tidak ada firewall blocking port 6274
- Coba gunakan HTTP instead of HTTPS untuk local testing
