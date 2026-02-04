# Dokumentasi MCP Guru Server - Integrasi n8n

## Overview

MCP (Model Context Protocol) Guru Server menyediakan API untuk mengelola jadwal mengajar dan absensi siswa. Dokumentasi ini menjelaskan cara integrasi dengan n8n.

---

## Konfigurasi Dasar

### Endpoint
```
https://management-sekolah.test/mcp/guru
```

### Authentication
- **Type**: Bearer Token
- **Token**: `guru-mcp-token-2024`
- **Header**: `Authorization: Bearer guru-mcp-token-2024`

### Headers
```
Content-Type: application/json
Authorization: Bearer guru-mcp-token-2024
```

---

## Setup di n8n

### 1. Menggunakan MCP Node (Native)

1. **Install MCP Node** (jika belum tersedia):
   - Settings → Community Nodes
   - Install: `@n8n/n8n-nodes-mcp`

2. **Add MCP Server Node**:
   ```yaml
   Node: MCP Server
   ├── Transport: HTTP
   ├── URL: https://management-sekolah.test/mcp/guru
   ├── Authentication:
   │   ├── Type: Header
   │   ├── Header Name: Authorization
   │   └── Value: Bearer guru-mcp-token-2024
   └── Timeout: 30000ms
   ```

3. **Add MCP Tool Node**:
   - Pilih server yang sudah dikonfigurasi
   - Pilih tool yang ingin digunakan
   - Isi parameter sesuai kebutuhan

### 2. Menggunakan HTTP Request Node (Alternative)

```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "https://management-sekolah.test/mcp/guru",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer guru-mcp-token-2024"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{$json.body}}"
      },
      "name": "MCP Guru Server",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1
    }
  ]
}
```

---

## Daftar Tools

### 1. get-kelas
Melihat daftar semua kelas yang tersedia.

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `level` | string | No | Filter level (10, 11, 12) |
| `jurusan` | string | No | Filter jurusan (RPL, TKJ, AK, dll) |

**Contoh Request:**
```json
{
  "tool": "get-kelas",
  "arguments": {}
}
```

**Contoh Response:**
```
📚 Daftar Kelas
═══════════════════

🏫 XI-AFM2
   📊 Level: 11
   🎓 Jurusan: AFM2
   👨‍🏫 Wali Kelas: Rendika Rijalah XI-AFM2
```

---

### 2. get-siswa-kelas
Melihat daftar siswa dalam kelas tertentu.

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `nama_kelas` | string | Yes | Nama kelas (contoh: XI-AFM2) |

**Contoh Request:**
```json
{
  "tool": "get-siswa-kelas",
  "arguments": {
    "nama_kelas": "XI-AFM2"
  }
}
```

**Contoh Response:**
```
👥 Daftar Siswa
═══════════════════
🏫 XI-AFM2
👨‍🏫 Wali Kelas: Rendika Rijalah XI-AFM2
📊 Total: 25 siswa

📋 Nama Siswa:
    1. Akmal Irsyad Siswadi XI-AFM2
    2. Andika Muhamad Ramadhan XI-AFM2
    3. Anggi Anggraeni XI-AFM2
    ...
```

---

### 3. catat-absensi ⭐ (TOOL UTAMA)
Mencatat absensi dengan format fleksibel.

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `email_guru` | string | Yes | Email guru yang mengisi |
| `kelas` | string | Yes | Nama kelas |
| `tanggal` | string | Yes | Tanggal (YYYY-MM-DD) |
| `siswa_hadir` | string | No | Daftar nama siswa hadir |
| `siswa_sakit` | string | No | Daftar nama siswa sakit |
| `siswa_izin` | string | No | Daftar nama siswa izin |
| `siswa_alpha` | string | No | Daftar nama siswa alpha |
| `siswa_tidak_masuk` | string | No | Daftar siswa tidak masuk (status belum jelas) |
| `catatan` | string | No | Catatan tambahan |

**Contoh Request - Absensi Lengkap:**
```json
{
  "tool": "catat-absensi",
  "arguments": {
    "email_guru": "guru@sekolah.com",
    "kelas": "XI-AFM2",
    "tanggal": "2025-02-04",
    "siswa_hadir": "Andika, Anggi, Bagus",
    "siswa_sakit": "Akmal",
    "siswa_alpha": "Rizqi",
    "catatan": "Kelas berjalan kondusif"
  }
}
```

**Contoh Request - Status Belum Jelas:**
```json
{
  "tool": "catat-absensi",
  "arguments": {
    "email_guru": "guru@sekolah.com",
    "kelas": "XI-AFM2",
    "tanggal": "2025-02-04",
    "siswa_tidak_masuk": "Akmal, Rizal",
    "catatan": "Kelas berjalan kondusif"
  }
}
```

**Contoh Response - Success:**
```
📊 Hasil Absensi
═══════════════════
📚 Kimia
🏫 XI-AFM2
📅 2025-02-04

📋 Ringkasan:
   ✅ Hadir: 3 siswa
   🤒 Sakit: 1 siswa
   ❌ Alpha: 1 siswa

📝 Catatan: Kelas berjalan kondusif
```

**Contoh Response - Perlu Klarifikasi:**
```
📊 Hasil Absensi
═══════════════════
📚 Kimia
🏫 XI-AFM2
📅 2025-02-04

📋 Ringkasan:

⚠️ Perlu Klarifikasi (tidak masuk, status belum jelas):
   • Akmal (✓ Akmal Irsyad Siswadi XI-AFM2)
   • Rizal (✗ tidak ditemukan)

💡 Silakan sebutkan statusnya: sakit, izin, atau alpha.

📝 Catatan: Kelas berjalan kondusif
```

---

### 4. lihat-jadwal
Melihat jadwal mengajar guru.

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `email_guru` | string | Yes | Email guru |
| `hari` | string | No | Filter hari (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu) |

**Contoh Request:**
```json
{
  "tool": "lihat-jadwal",
  "arguments": {
    "email_guru": "guru@sekolah.com",
    "hari": "Senin"
  }
}
```

---

### 5. lihat-jadwal-hari-ini
Melihat jadwal hari ini dengan status absensi.

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `email_guru` | string | Yes | Email guru |

**Contoh Request:**
```json
{
  "tool": "lihat-jadwal-hari-ini",
  "arguments": {
    "email_guru": "guru@sekolah.com"
  }
}
```

---

### 6. lihat-absensi
Melihat data absensi untuk jadwal tertentu.

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `email_guru` | string | Yes | Email guru |
| `jadwal_id` | integer | Yes | ID jadwal |
| `tanggal` | string | Yes | Tanggal (YYYY-MM-DD) |

**Contoh Request:**
```json
{
  "tool": "lihat-absensi",
  "arguments": {
    "email_guru": "guru@sekolah.com",
    "jadwal_id": 64,
    "tanggal": "2025-02-04"
  }
}
```

---

### 7. proses-absensi-text
Mengolah text absensi natural language.

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `email_guru` | string | Yes | Email guru |
| `text_absensi` | string | Yes | Text absensi natural language |
| `tanggal` | string | Yes | Tanggal (YYYY-MM-DD) |
| `kelas` | string | No | Kelas (jika tidak ada di text) |

**Contoh Request:**
```json
{
  "tool": "proses-absensi-text",
  "arguments": {
    "email_guru": "guru@sekolah.com",
    "text_absensi": "Hadir: Akmal, Andika, Anggi\nSakit: Azriel\nIzin: Bagus\nCatatan: Kelas berjalan kondusif.",
    "tanggal": "2025-02-04",
    "kelas": "XI-AFM2"
  }
}
```

---

### 8. absen-siswa
Mencatat absensi per siswa (manual).

**Parameter:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `email_guru` | string | Yes | Email guru |
| `jadwal_id` | integer | Yes | ID jadwal |
| `siswa_id` | integer | Yes | ID siswa |
| `tanggal` | string | Yes | Tanggal (YYYY-MM-DD) |
| `status` | string | Yes | Status: hadir, sakit, izin, alpha |

**Contoh Request:**
```json
{
  "tool": "absen-siswa",
  "arguments": {
    "email_guru": "guru@sekolah.com",
    "jadwal_id": 64,
    "siswa_id": 273,
    "tanggal": "2025-02-04",
    "status": "hadir"
  }
}
```

---

## Workflow AI Agent

### Scenario 1: Absensi Lengkap

```
User: "Absen kelas XI-AFM2, hadir: Akmal, Andika, Anggi, sakit: Azriel"

AI Agent:
  1. catat-absensi(
       email_guru: "guru@sekolah.com",
       kelas: "XI-AFM2",
       tanggal: "2025-02-04",
       siswa_hadir: "Akmal, Andika, Anggi",
       siswa_sakit: "Azriel"
     )
  
  Response: ✅ Berhasil tercatat
```

### Scenario 2: Status Tidak Jelas

```
User: "akmal dan rizal tidak masuk"

AI Agent:
  1. catat-absensi(
       email_guru: "guru@sekolah.com",
       kelas: "XI-AFM2",
       tanggal: "2025-02-04",
       siswa_tidak_masuk: "akmal, rizal"
     )
  
  Response: ⚠️ Perlu klarifikasi status

AI Agent: "Oke, akmal dan rizal tidak masuk. Apakah mereka sakit, izin, atau alpha?"

User: "Akmal sakit, Rizal alpha"

AI Agent:
  2. catat-absensi(
       email_guru: "guru@sekolah.com",
       kelas: "XI-AFM2",
       tanggal: "2025-02-04",
       siswa_sakit: "Akmal",
       siswa_alpha: "Rizal"
     )
  
  Response: ✅ Berhasil tercatat
```

### Scenario 3: Kelas Tidak Diketahui

```
User: "absen hari ini"

AI Agent:
  1. get-kelas()
  
  Response: Daftar kelas

AI Agent: "Untuk kelas mana?"

User: "XI-AFM2"

AI Agent:
  2. get-siswa-kelas(nama_kelas: "XI-AFM2")
  
  Response: Daftar siswa

AI Agent: "Silakan sebutkan siapa saja yang hadir/sakit/izin/alpha."

User: "Hadir semua kecuali Akmal sakit"

AI Agent:
  3. catat-absensi(...)
```

---

## Tips & Troubleshooting

### 1. Partial Name Matching
- Nama siswa di database: `"Akmal Irsyad Siswadi XI-AFM2"`
- Bisa dicari dengan: `"Akmal"`, `"Akmal Irsyad"`, dll
- System akan mencocokkan partial match

### 2. Format Tanggal
- Selalu gunakan format: `YYYY-MM-DD`
- Contoh: `2025-02-04`

### 3. Multiple Names
- Pisahkan nama dengan koma: `"Akmal, Andika, Anggi"`
- atau: `"Akmal,Andika,Anggi"`

### 4. Error Handling
Jika siswa tidak ditemukan:
- Gunakan `get-siswa-kelas` untuk melihat nama lengkap
- Pastikan spelling benar
- Coba dengan nama depan saja

### 5. Token Expired
Jika mendapat response `401 Unauthorized`:
- Cek token di `app/Http/Middleware/StaticTokenAuth.php`
- Default token: `guru-mcp-token-2024`

---

## Contoh Workflow n8n Lengkap

### Workflow: Chatbot Absensi

```
[Webhook Trigger] 
    ↓
[Function Node: Parse Intent]
    ↓
[If: Intent = Absensi]
    ↓ YES
[HTTP Request: get-kelas] (jika kelas tidak disebutkan)
    ↓
[HTTP Request: get-siswa-kelas] (jika perlu daftar siswa)
    ↓
[HTTP Request: catat-absensi]
    ↓
[Function Node: Format Response]
    ↓
[Respond to Webhook]
```

### Code Snippet: Function Node (Parse Intent)

```javascript
// Parse user message
const message = $input.first().json.body.message;
const userEmail = $input.first().json.body.email;

// Extract kelas
const kelasMatch = message.match(/kelas\s+([A-Z0-9\-]+)/i);
const kelas = kelasMatch ? kelasMatch[1] : null;

// Extract siswa yang tidak masuk
const tidakMasukMatch = message.match(/([^,]+)(?:dan|,)?\s+([^,]+)\s+tidak\s+masuk/i);

return {
  json: {
    email_guru: userEmail,
    kelas: kelas,
    siswa_tidak_masuk: tidakMasukMatch ? `${tidakMasukMatch[1]},${tidakMasukMatch[2]}` : null,
    raw_message: message
  }
};
```

---

## Testing

### Test dengan curl

```bash
# Get kelas
curl -X POST https://management-sekolah.test/mcp/guru \
  -H "Authorization: Bearer guru-mcp-token-2024" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get-kelas",
    "arguments": {}
  }'

# Catat absensi
curl -X POST https://management-sekolah.test/mcp/guru \
  -H "Authorization: Bearer guru-mcp-token-2024" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "catat-absensi",
    "arguments": {
      "email_guru": "guru@sekolah.com",
      "kelas": "XI-AFM2",
      "tanggal": "2025-02-04",
      "siswa_hadir": "Akmal, Andika",
      "siswa_sakit": "Anggi"
    }
  }'
```

---

## Changelog

### v1.0.0
- Initial release
- 8 tools tersedia
- Static token authentication
- Partial name matching

---

## Support

Untuk pertanyaan atau issue, silakan hubungi tim IT sekolah.
