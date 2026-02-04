# Workflow Decision Guide

Panduan memilih antara **OpenSpec**, **BMAD**, dan **GSD** untuk project Anda.

---

## Quick Decision Tree

```
Apakah ini project baru / major rewrite?
├── YA → BMAD (mulai dari Product Brief)
└── TIDAK → Apakah ini satu fitur/isolasi perubahan?
    ├── YA → OpenSpec (artifact-based change)
    └── TIDAK → Apakah fokusnya eksekusi cepat dengan milestone?
        ├── YA → GSD (Get Shit Done)
        └── TIDAK → OpenSpec (default untuk perubahan)
```

---

## Perbandingan Cepat

| Aspek | OpenSpec | BMAD | GSD |
|-------|----------|------|-----|
| **Fokus** | Single change/feature | Project end-to-end | Execution & milestone |
| **Skala** | Fitur/bug tunggal | Project baru/major | Delivery cepat |
| **Output** | Delta specs + tasks | PRD + Architecture + Epics | Phase plans + progress |
| **Cocok untuk** | Iterasi & maintenance | Greenfield project | Deadline-driven work |

---

## Kapan Menggunakan Masing-Masing?

### OpenSpec
**Gunakan jika:**
- Ada **satu fitur spesifik** yang mau dikerjakan
- Butuh **dokumentasi perubahan** yang rapi (delta specs)
- Mau workflow **step-by-step** yang terstruktur
- Contoh: "Tambah fitur export PDF di halaman laporan"

**Workflow:**
```
Explore → Design → Tasks → Verify → Archive
```

### BMAD
**Gunakan jika:**
- Memulai **project baru** atau **major feature** dari nol
- Butuh **dokumentasi lengkap**: Product Brief, PRD, Architecture, UX Design
- Tim butuh **epics dan stories** terstruktur dengan acceptance criteria
- Contoh: "Build sistem manajemen sekolah dari awal"

**Workflow:**
```
Product Brief → PRD → Architecture → UX Design → Epics → Stories → Dev
```

### GSD
**Gunakan jika:**
- Sudah punya **visi jelas** dan butuh **eksekusi cepat**
- Mau **milestone-based tracking** dengan phase-phase terukur
- Butuh **parallel execution** dan wave-based development
- Contoh: "Release v2.0 dalam 3 bulan dengan fitur A, B, C"

**Workflow:**
```
Milestone → Phase 1 → Phase 2 → Phase 3 → Verify
```

---

## Decision Matrix

| Situasi | Pilihan |
|---------|---------|
| "Mau bikin aplikasi baru" | **BMAD** |
| "Tambahin fitur X" | **OpenSpec** |
| "Fix bug di modul Y" | **OpenSpec** |
| "Deadline 2 bulan, harus kelar" | **GSD** |
| "Project besar, tim banyak" | **BMAD + OpenSpec** |
| "Maintenance dan iterasi rutin" | **OpenSpec** |
| "Refactor arsitektur major" | **BMAD** |

---

## Kombinasi Tools (Best Practice)

### BMAD + OpenSpec
Untuk project besar dengan banyak fitur:

```
BMAD:     Product Brief → PRD → Architecture → Epics
             ↓
OpenSpec:    [Change 1: Fitur A] → Explore → Design → Tasks → Verify → Archive
             [Change 2: Fitur B] → Explore → Design → Tasks → Verify → Archive
             [Change 3: Bugfix]  → Explore → Design → Tasks → Verify → Archive
```

### GSD + OpenSpec
Untuk delivery cepat dengan tracking perubahan:

```
GSD:      Milestone v1.0 → Phase 1 → Phase 2 → Phase 3
             ↓
OpenSpec:    Setiap phase bisa jadi satu "change" yang di-track
```

---

## Struktur Folder Rekomendasi

```
project-root/
│
├── .planning/                    ← BMAD/GSD project-level docs (opsional)
│   ├── 01-product-brief.md
│   ├── 02-prd.md
│   ├── 03-architecture.md
│   └── 04-epics/
│       └── epic-*.md
│
├── .openspec/                    ← OpenSpec changes
│   ├── active/                   ← Changes sedang dikerjakan
│   │   ├── feat-*/
│   │   ├── fix-*/
│   │   └── refactor-*/
│   └── archive/                  ← Changes selesai
│       └── [YYYY-MM-DD]-*/
│
└── src/                          ← Source code
```

---

## Contoh Penggunaan

### Skenario 1: Fitur Baru
```
User: "Tambahin fitur export PDF di halaman laporan"

Decision: OpenSpec
Command: /opsx-new
Reason: Satu fitur isolasi, tidak perlu PRD lengkap
```

### Skenario 2: Project Baru
```
User: "Mau bikin sistem manajemen sekolah dari nol"

Decision: BMAD
Command: /bmad-bmm-workflow-init
Reason: Butuh struktur lengkap dari ide sampai rilis
```

### Skenario 3: Deadline Ketat
```
User: "Harus rilis v2.0 dalam 2 bulan"

Decision: GSD
Command: /gsd-new-milestone
Reason: Fokus eksekusi dengan milestone tracking
```

### Skenario 4: Maintenance
```
User: "Fix bug login tidak jalan di mobile"

Decision: OpenSpec
Command: /opsx-new
Reason: Bugfix isolasi, dokumentasi perubahan cukup
```

---

## Cheat Sheet

```bash
# OpenSpec - untuk single change
/opsx-new              # Start new change
/opsx-continue         # Continue existing change
/opsx-verify           # Verify implementation
/opsx-archive          # Archive completed change

# BMAD - untuk project baru
/bmad-bmm-workflow-init           # Initialize project
/bmad-bmm-create-product-brief    # Create product brief
/bmad-bmm-prd                     # Create PRD
/bmad-bmm-create-architecture     # Create architecture
/bmad-bmm-create-epics-and-stories # Create epics & stories
/bmad-bmm-dev-story               # Execute story

# GSD - untuk execution-focused
/gsd-new-project       # Start new project
/gsd-new-milestone     # Start new milestone
/gsd-plan-phase        # Plan phase execution
/gsd-execute-phase     # Execute phase
/gsd-verify-work       # Verify completed work
```

---

## Tips

1. **Start small**: Kalau bingung, mulai dengan OpenSpec (paling fleksibel)
2. **Scale up**: Jika project berkembang, bisa migrasi ke BMAD atau GSD
3. **Hybrid approach**: BMAD/GSD untuk framework besar, OpenSpec untuk changes individual
4. **Document everything**: Setiap tool menghasilkan dokumentasi yang berbeda, pilih yang sesuai kebutuhan tim

---

## FAQ

**Q: Bisa pakai ketiga-tiganya sekaligus?**  
A: Tidak direkomendasikan. Pilih satu sebagai "framework utama", yang lain sebagai supplement.

**Q: Haruskah migrate dari satu tool ke tool lain?**  
A: Tidak perlu. Setiap tool bisa digunakan sesuai konteks tanpa migrasi.

**Q: Mana yang paling mudah untuk pemula?**  
A: OpenSpec - paling fleksibel dan tidak memerlukan setup project yang kompleks.

**Q: Mana yang paling cocok untuk solo developer?**  
A: OpenSpec atau GSD - keduanya lightweight dan tidak memerlukan koordinasi tim.
