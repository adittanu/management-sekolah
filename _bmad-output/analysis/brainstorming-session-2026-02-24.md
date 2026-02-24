---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Perpustakaan digital admin berbasis PDF dengan alur pinjam-kembali dan pembacaan kolaboratif'
session_goals: 'Menentukan rancangan fitur katalog, pinjam-kembali, reader PDF di situs, pelacakan progress baca per user, serta indikator realtime siapa membaca sampai halaman tertentu'
selected_approach: 'ai-recommended'
techniques_used: ['Constraint Mapping', 'Morphological Analysis', 'Role Playing']
ideas_generated:
  - 'Signed Viewer Lock'
  - 'Session-Safe Expiry'
  - 'Heartbeat Presence Grid'
  - 'Active Loan Gate'
  - 'No-Extend Reborrow Loop'
  - 'Name+Class Monitor'
  - 'Compact Presence Chip'
  - 'Last-Page Resume'
  - 'Expiry Banner Nudge'
  - 'Privacy-by-Role Surface'
  - 'Event-Only Broadcast'
  - 'Reader Audit Timeline'
  - 'Loan Snapshot Guard'
  - 'Presence Freshness Window'
  - 'Atomic Page Cursor'
  - 'Soft-Stale Participant'
  - 'Event Idempotency Key'
  - 'Dual Path Realtime'
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Adiet
**Date:** 2026-02-24

## Session Overview

**Topic:** Perpustakaan digital admin berbasis PDF dengan alur pinjam-kembali dan pembacaan kolaboratif.
**Goals:** Menentukan rancangan fitur katalog, pinjam-kembali, reader PDF di situs, pelacakan progress baca per user, serta indikator realtime siapa membaca sampai halaman tertentu.

### Context Guidance

Konteks codebase menunjukkan rute dan halaman admin perpustakaan sudah tersedia sebagai dasar awal. Fokus brainstorming diarahkan ke pendalaman arsitektur fitur digital-first (PDF), observabilitas progress baca per halaman, dan pengalaman kolaboratif antar pembaca.

### Session Setup

Sesi dimulai dari kebutuhan bisnis yang jelas: perpustakaan digital bukan hanya katalog, tetapi juga ruang baca online dengan visibilitas aktivitas pembaca. Untuk menjaga momentum, pendekatan dipilih ke AI-recommended flow agar teknik ideasi langsung disesuaikan dengan target fitur, kompleksitas realtime, dan prioritas implementasi bertahap (MVP ke fase lanjutan).

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Perpustakaan digital admin berbasis PDF dengan fokus pada alur pinjam-kembali, pembacaan di situs, dan indikator progres baca kolaboratif.

**Recommended Techniques:**

- **Constraint Mapping:** Memetakan batasan inti (hak akses, lisensi PDF, skalabilitas realtime, privasi progress baca) agar ide yang dihasilkan feasible sejak awal.
- **Morphological Analysis:** Menyusun kombinasi komponen fitur (katalog, transaksi pinjam, session baca, tracking halaman, presence) untuk menemukan desain MVP paling efektif.
- **Role Playing:** Menguji ide dari perspektif admin, petugas, siswa, dan guru supaya alur operasional dan UX lintas peran lebih matang.

**AI Rationale:** Kombinasi ini menyeimbangkan ketepatan teknis dan nilai produk: dimulai dari batasan nyata, diperluas ke eksplorasi kombinasi solusi, lalu divalidasi melalui simulasi peran agar solusi tidak hanya canggih tetapi benar-benar bisa dipakai di sekolah.

## Technique Execution Results

**Constraint Mapping:**

- Non-negotiable: PDF read-in-site only, pinjam durasi terbatas, dan realtime presence ringan.
- Keputusan teknis: update halaman saat page-change + heartbeat 15 detik, auto-offline 30-45 detik.
- Output: batasan sistem jelas sehingga rancangan MVP tetap feasible di beban sekolah.

**Morphological Analysis:**

- Kombinasi MVP dipilih: Katalog + Pinjam/Kembali + Reader PDF + indikator realtime siapa di halaman.
- Rule akses dipilih: reader hanya untuk loan aktif.
- Rule sirkulasi dipilih: tidak ada perpanjangan; habis masa pinjam harus pinjam ulang.

**Role Playing:**

- Perspektif siswa: jika loan habis saat membaca, sesi aktif tetap boleh lanjut sampai tab ditutup.
- Perspektif admin: monitoring read-only (nama + kelas) tanpa aksi intervensi langsung pada MVP.
- Perspektif operasional: indikator presence harus informatif tapi tidak membebani server.

### Key Ideas Generated

**[Category #1]**: Signed Viewer Lock
_Concept_: Endpoint file PDF memakai signed URL berumur pendek dan hanya di-resolve jika loan aktif. Viewer berjalan in-site dengan kontrol download non-prioritas pada MVP.
_Novelty_: Menggabungkan kontrol akses transaksi pinjam langsung ke jalur render file, bukan sekadar auth halaman.

**[Category #2]**: Session-Safe Expiry
_Concept_: Saat loan expired di tengah baca, sesi berjalan tetap aktif sampai user keluar/refresh. Akses ulang ditolak sampai pinjam ulang berhasil.
_Novelty_: Menjaga pengalaman belajar tetap mulus tanpa melonggarkan aturan masa pinjam.

**[Category #3]**: Heartbeat Presence Grid
_Concept_: Presence memakai dua sinyal: page-change event + heartbeat 15 detik. User dianggap offline otomatis bila 30-45 detik tidak ada sinyal.
_Novelty_: Realtime cukup akurat tanpa stream event kontinu yang berat.

**[Category #4]**: Active Loan Gate
_Concept_: Semua aksi reader (open, next/prev, sync progress) validasi `loan_active=true`. Saat false, API mengembalikan state lock + metadata expired.
_Novelty_: Konsistensi domain dijaga di level service, bukan hanya di komponen UI.

**[Category #5]**: No-Extend Reborrow Loop
_Concept_: Sistem tidak menyediakan extend; alur setelah expired adalah reborrow baru dengan jejak riwayat terpisah. Progress terakhir tetap dapat dipakai sebagai start suggestion.
_Novelty_: Sirkulasi tetap disiplin, namun kontinuitas belajar tetap nyaman.

**[Category #6]**: Name+Class Monitor
_Concept_: Panel admin menampilkan daftar pembaca aktif per halaman dalam format nama + kelas. Panel bersifat read-only untuk MVP.
_Novelty_: Memberi visibilitas pedagogis tanpa menambah risiko aksi massal yang salah sasaran.

**[Category #7]**: Compact Presence Chip
_Concept_: Di sisi siswa, indikator default berupa chip ringkas `X orang di halaman ini`, klik untuk membuka daftar nama.
_Novelty_: Menjaga fokus membaca sambil tetap menyediakan transparansi kolaboratif saat dibutuhkan.

**[Category #8]**: Last-Page Resume
_Concept_: Progress halaman terakhir disimpan per user-book dan dipakai saat sesi baca baru dimulai kembali.
_Novelty_: UX terasa personal walau model pinjam ulang ketat.

**[Category #9]**: Expiry Banner Nudge
_Concept_: Banner status muncul H-1 dan saat sesi sedang berjalan mendekati/sudah melewati expiry. CTA tunggal mengarah ke aksi pinjam ulang.
_Novelty_: Mengurangi kejutan lock akses dengan komunikasi kontekstual in-reader.

**[Category #10]**: Privacy-by-Role Surface
_Concept_: Mode nama lengkap aktif sesuai keputusan saat ini; tetap disiapkan switch konfigurasi role bila kebijakan berubah.
_Novelty_: Keputusan transparansi saat ini tidak mengunci fleksibilitas kebijakan jangka panjang.

**[Category #11]**: Event-Only Broadcast
_Concept_: Broadcast hanya pada join/leave/page-change; sinkronisasi periodik dilakukan polling ringan untuk stabilitas.
_Novelty_: Hybrid realtime yang tahan terhadap lonjakan koneksi tanpa kehilangan konteks kolaborasi.

**[Category #12]**: Reader Audit Timeline
_Concept_: Riwayat baca menyimpan jejak waktu dan halaman per user untuk kebutuhan monitoring dan evaluasi penggunaan.
_Novelty_: Audit trail dibangun sebagai fitur edukasi operasional, bukan sekadar log teknis.

## Advanced Elicitation Deep Dive

**Target:** Active Loan Gate + Presence Grid
**Mode:** Autonomous deep-dive using recommended methods

### Method #1: Architecture Decision Records

**ADR-01 - Loan Validation Boundary**
- **Decision:** Semua operasi reader (`open`, `sync page`, `presence ping`) melewati service `LoanAccessPolicy`.
- **Rationale:** Konsistensi rule pinjam tidak bergantung ke UI/route saja.
- **Consequence:** Perubahan kebijakan pinjam cukup di satu titik domain.

**ADR-02 - Session-Safe Expiry Handling**
- **Decision:** Loan di-check saat membuka sesi dan periodik di backend; jika expired di tengah sesi, sesi tetap boleh jalan sampai tab ditutup.
- **Rationale:** Menjaga UX belajar tanpa melanggar aturan akses ulang.
- **Consequence:** Endpoint re-open wajib blokir jika status expired.

**ADR-03 - Presence Data Model**
- **Decision:** Presence disimpan sebagai state ringan per `book_id + user_id` dengan `current_page`, `last_seen_at`, `session_id`.
- **Rationale:** Cukup untuk indikator realtime dan monitoring admin tanpa event log berlebihan.
- **Consequence:** Butuh cleanup stale record berbasis timeout.

**ADR-04 - Realtime Transport Strategy**
- **Decision:** Hybrid: broadcast event penting (join/leave/page-change), plus polling sinkronisasi berkala.
- **Rationale:** Stabil untuk trafik sekolah, tidak terlalu sensitif pada koneksi putus singkat.
- **Consequence:** UI harus merge data event + polling snapshot.

### Method #2: Failure Mode Analysis

**Failure Mode A - Presence nyangkut online**
- **Cause:** Tab ditutup paksa tanpa event leave.
- **Mitigation:** Timeout 30-45 detik dengan status stale otomatis.

**Failure Mode B - Loncat halaman tidak sinkron**
- **Cause:** Event page-change datang out-of-order.
- **Mitigation:** Simpan `page_updated_at` + tolak update yang lebih lama.

**Failure Mode C - Expired race condition**
- **Cause:** Loan habis bersamaan dengan request page sync.
- **Mitigation:** Gunakan snapshot status loan pada request start + evaluasi final di response policy.

**Failure Mode D - Broadcast duplikat**
- **Cause:** Reconnect client mengirim ulang event yang sama.
- **Mitigation:** Event idempotency key (`session_id + seq_no`) di consumer.

**Failure Mode E - Beban puncak jam belajar**
- **Cause:** Banyak user aktif di buku yang sama.
- **Mitigation:** Kirim daftar nama terbatas (mis. 10), sisanya agregat `+N lainnya`.

### Enhanced Ideas from Deep Dive

**[Category #13]**: Loan Snapshot Guard
_Concept_: Tiap request reader membawa snapshot status loan untuk memastikan kebijakan konsisten dalam satu transaksi.
_Novelty_: Menutup gap race condition antara validasi awal dan update state akhir.

**[Category #14]**: Presence Freshness Window
_Concept_: Presence dibedakan jadi `active` (<15 detik), `warm` (15-45 detik), dan `stale` (>45 detik) untuk UX indikator yang jujur.
_Novelty_: Bukan sekadar online/offline; memberi kualitas sinyal keterkinian data.

**[Category #15]**: Atomic Page Cursor
_Concept_: Update halaman memakai guard timestamp agar urutan event konsisten meski jaringan tidak stabil.
_Novelty_: Menghindari indikator mundur ke halaman lama.

**[Category #16]**: Soft-Stale Participant
_Concept_: User stale tetap tampil sesaat sebagai “baru saja membaca di sini” sebelum hilang total.
_Novelty_: Menjembatani gap persepsi antara realtime teknis dan pengalaman manusia.

**[Category #17]**: Event Idempotency Key
_Concept_: Setiap event presence punya kunci unik per sesi untuk mencegah duplikasi efek UI.
_Novelty_: Reconnect client tidak lagi mengacaukan jumlah pembaca.

**[Category #18]**: Dual Path Realtime
_Concept_: Kombinasi event-driven untuk momen penting dan polling snapshot sebagai self-healing channel.
_Novelty_: Realtime yang tahan gangguan tanpa arsitektur berlebihan.

## Idea Organization and Prioritization

**Thematic Organization:**

### Theme 1: Access and Lending Governance
_Focus_: Kepatuhan aturan pinjam dan kontrol akses reader.
- Ideas: Signed Viewer Lock, Active Loan Gate, No-Extend Reborrow Loop, Session-Safe Expiry, Loan Snapshot Guard
- Pattern Insight: Semua kontrol baca harus diturunkan dari status loan aktif agar aturan domain selalu konsisten.

### Theme 2: Realtime Presence and Synchronization
_Focus_: Menampilkan siapa membaca di halaman mana secara ringan dan stabil.
- Ideas: Heartbeat Presence Grid, Event-Only Broadcast, Presence Freshness Window, Atomic Page Cursor, Event Idempotency Key, Dual Path Realtime
- Pattern Insight: Strategi hybrid event + snapshot memberi keseimbangan akurasi realtime dan ketahanan operasional.

### Theme 3: User Experience and Classroom Transparency
_Focus_: Pengalaman baca yang mulus sekaligus transparan untuk admin/pengajar.
- Ideas: Name+Class Monitor, Compact Presence Chip, Last-Page Resume, Expiry Banner Nudge, Soft-Stale Participant
- Pattern Insight: UX menjaga fokus belajar, sementara monitoring tetap informatif untuk kebutuhan sekolah.

### Theme 4: Observability and Evaluation
_Focus_: Jejak baca untuk monitoring dan perbaikan layanan.
- Ideas: Reader Audit Timeline, Privacy-by-Role Surface
- Pattern Insight: Data perilaku baca jadi aset evaluasi pedagogis jika ditampilkan sesuai kebijakan peran.

**Breakthrough Concepts:**
- Session-Safe Expiry + Reborrow Loop (aturan tegas tanpa merusak sesi belajar aktif)
- Dual Path Realtime (event-driven penting + polling self-heal)
- Presence Freshness Window (indikator kualitas data realtime, bukan sekadar online/offline)

**Implementation-Ready Ideas (MVP):**
- Active Loan Gate
- Heartbeat Presence Grid
- Name+Class Monitor
- Compact Presence Chip
- Expiry Banner Nudge

**Prioritization Results:**

- **Top Priority Ideas:** Active Loan Gate, Heartbeat Presence Grid, Session-Safe Expiry
- **Quick Win Opportunities:** Compact Presence Chip, Expiry Banner Nudge, Last-Page Resume
- **Breakthrough Concepts:** Dual Path Realtime, Presence Freshness Window, Event Idempotency Key

**Action Planning:**

### Priority 1: Active Loan Gate
**Why This Matters:** Fondasi keamanan dan kepatuhan pinjam untuk semua alur reader.
**Next Steps:**
1. Buat policy/service `LoanAccessPolicy` untuk validasi open/sync/ping.
2. Terapkan guard di endpoint reader dan progress.
3. Tambahkan response state `expired_locked` + metadata waktu kadaluarsa.
**Resources Needed:** 1 backend dev, skema tabel loan yang jelas.
**Timeline:** 2-3 hari.
**Success Indicators:** Tidak ada akses reader tanpa loan aktif; seluruh endpoint konsisten.

### Priority 2: Presence Grid (Hybrid Realtime)
**Why This Matters:** Fitur kolaboratif inti “siapa baca di halaman ini”.
**Next Steps:**
1. Implement heartbeat 15 detik + timeout stale 30-45 detik.
2. Broadcast join/leave/page-change + polling snapshot berkala.
3. Simpan `page_updated_at` dan `session_id` untuk idempotency.
**Resources Needed:** 1 backend dev, 1 frontend dev, kanal broadcast.
**Timeline:** 3-5 hari.
**Success Indicators:** Nama pembaca per halaman akurat, minim status nyangkut.

### Priority 3: Session-Safe Expiry UX
**Why This Matters:** Menjaga pengalaman belajar ketika loan habis di tengah baca.
**Next Steps:**
1. Definisikan rule: sesi aktif lanjut, re-open diblokir.
2. Tambahkan banner in-reader + CTA pinjam ulang.
3. Simpan progress terakhir untuk resume setelah reborrow.
**Resources Needed:** 1 frontend dev, validasi backend.
**Timeline:** 2-3 hari.
**Success Indicators:** Keluhan lock mendadak turun, alur pinjam ulang jelas.

## Session Summary and Insights

**Key Achievements:**
- 18 ide terstruktur dihasilkan dan dipetakan ke 4 tema utama.
- 3 prioritas implementasi disepakati dengan action plan konkret.
- Arsitektur MVP terkunci: read-in-site only, active-loan gate, hybrid realtime presence.

**Session Reflections:**
- Keputusan user konsisten pada keseimbangan disiplin aturan dan kenyamanan belajar.
- Pendekatan teknik berurutan (constraint -> kombinasi -> role) efektif menghasilkan blueprint yang bisa langsung dieksekusi.

## Session Completion

**Workflow completed successfully.**

Hasil sesi ini siap dipakai sebagai dasar implementasi fitur `Perpustakaan Digital` dengan scope MVP yang jelas dan risiko teknis utama sudah terpetakan.
