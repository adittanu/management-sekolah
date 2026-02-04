# OpenSpec (OPSX) Commands Cheatsheet

> OpenSpec adalah framework **experimental** untuk software development menggunakan pendekatan **artifact-driven** dengan workflow terstruktur.

---

## Quick Reference

| Command | Fungsi | Kapan Digunakan |
|---------|--------|-----------------|
| `/opsx-new` | Memulai change baru | Awal pengembangan fitur/fix |
| `/opsx-continue` | Melanjutkan change | Progress ke artifact berikutnya |
| `/opsx-ff` | Fast-forward change | Generate semua artifact sekaligus |
| `/opsx-explore` | Explore mode | Investigasi & klarifikasi requirements |
| `/opsx-apply` | Implementasi change | Eksekusi tasks dari artifact |
| `/opsx-verify` | Verifikasi implementasi | Validasi sebelum archive |
| `/opsx-archive` | Archive change | Finalisasi change selesai |
| `/opsx-bulk-archive` | Archive banyak change | Archive paralel changes |
| `/opsx-sync` | Sync delta specs | Update main specs tanpa archive |

---

## 1. `/opsx-new` - Memulai Change Baru

### Fungsi
Membuat change baru menggunakan pendekatan artifact-driven workflow.

### Use Cases
- **New Feature**: Menambahkan fitur baru ke aplikasi
- **Bug Fix**: Memperbaiki bug dengan pendekatan terstruktur
- **Refactor**: Restrukturisasi kode dengan tracking
- **Spike**: Eksplorasi teknis dengan dokumentasi

### Workflow
1. User describe apa yang mau dibangun
2. System generate kebab-case name
3. Create change directory: `openspec/changes/<name>/`
4. Show artifact status & first artifact instructions
5. STOP - tunggu user direction

### Contoh
```
User: "Saya mau buat fitur authentication"
→ Change name: user-authentication
→ Location: openspec/changes/user-authentication/
→ Schema: default (spec-driven)
→ Artifacts: proposal → spec → test-plan → implementation
```

### Output
- Change directory structure
- Schema/workflow yang digunakan
- Status artifacts (0/N complete)
- Template untuk artifact pertama

---

## 2. `/opsx-continue` - Melanjutkan Change

### Fungsi
Melanjutkan work pada change yang sudah ada dengan membuat artifact berikutnya.

### Use Cases
- **Next Step**: Lanjut ke artifact selanjutnya dalam workflow
- **Resume**: Melanjutkan setelah pause/interupsi
- **Iterate**: Revisi artifact sebelumnya dan lanjutkan

### Workflow
1. Identify change yang sedang aktif
2. Check current status dengan `openspec status --change <name>`
3. Find next artifact yang "ready" (dependencies satisfied)
4. Get instructions: `openspec instructions <artifact-id> --change <name>`
5. Draft artifact berdasarkan template
6. User review & iterate sampai approved
7. Commit artifact & update status

### Contoh
```
Current: openspec/changes/user-authentication/
Status: 2/4 artifacts (proposal ✓, spec ✓, test-plan ○, implementation ○)
Next: test-plan
→ Draft test-plan → Review → Commit → Status updated
```

---

## 3. `/opsx-ff` - Fast-Forward Change

### Fungsi
Generate SEMUA artifacts yang diperlukan untuk implementasi dalam satu go.

### Use Cases
- **Urgent Fix**: Bug critical yang perlu cepat di-fix
- **Small Change**: Change kecil yang scope-nya jelas
- **Proof of Concept**: Quick demo tanpa full ceremony
- **Experienced Dev**: Developer yang sudah familiar dengan pattern

### ⚠️ Warning
- Skip step-by-step artifact creation
- Less deliberation, faster execution
- Cocok untuk experienced developers
- Tidak direkomendasikan untuk complex changes

### Workflow
1. Create change structure
2. Generate all artifacts sekaligus:
   - proposal.md
   - spec.md
   - test-plan.md
   - implementation.md
3. Semua artifacts dalam satu session
4. Ready untuk apply

---

## 4. `/opsx-explore` - Explore Mode

### Fungsi
Thinking partner untuk eksplorasi ide, investigasi masalah, dan klarifikasi requirements.

### Use Cases
- **Requirement Clarification**: Belum jelas mau build apa
- **Problem Investigation**: Analisis root cause sebelum fix
- **Architecture Decision**: Evaluasi berbagai approach
- **Tech Spike**: Eksplorasi teknis sebelum commit
- **Design Review**: Review design sebelum implementasi

### Karakteristik
- **No code changes**: Pure exploration & thinking
- **Collaborative**: Interactive dialog dengan AI
- **Documentation**: Hasil eksplorasi bisa di-save
- **Safe**: Tidak ada side effects ke codebase

### Contoh Scenarios
```
"Saya bingung antara pake JWT vs Session-based auth"
→ Explore: compare approaches, trade-offs, recommendations

"Ini bug aneh, muncul random"
→ Explore: investigate patterns, possible causes, debug strategies

"Mau refactor ini tapi takut breaking changes"
→ Explore: impact analysis, migration strategies, rollback plans
```

---

## 5. `/opsx-apply` - Implementasi Change

### Fungsi
Eksekusi tasks dari implementation artifact yang sudah dibuat.

### Use Cases
- **Execute Plan**: Jalankan implementation plan yang sudah di-spec
- **Follow Spec**: Implement berdasarkan spec yang sudah di-approve
- **Track Progress**: Mark tasks complete saat dikerjakan
- **Generate Code**: Buat file, function, components sesuai spec

### Workflow
1. Read implementation artifact
2. Parse tasks/subtasks
3. Execute satu per satu
4. Write tests (jika ada test-plan)
5. Validate hasil implementasi
6. Update task status

### Output
- Code yang di-generate
- Tests yang di-generate
- Task status updates
- Implementation evidence

---

## 6. `/opsx-verify` - Verifikasi Implementasi

### Fungsi
Validasi bahwa implementasi match dengan change artifacts sebelum archive.

### Use Cases
- **Pre-Archive Check**: Pastikan semua sesuai spec
- **Quality Gate**: Verifikasi completeness & correctness
- **Compliance Check**: Cek alignment dengan requirements
- **Final Review**: Last check sebelum mark complete

### Aspek yang Di-Verify
- ✅ Semua tasks dari implementation artifact selesai
- ✅ Code matches spec requirements
- ✅ Tests pass (jika ada)
- ✅ No coherence issues
- ✅ Documentation lengkap

### Output
- Verification report
- PASS / FAIL status
- List issues (jika ada)
- Recommendations

---

## 7. `/opsx-archive` - Archive Change

### Fungsi
Finalize dan archive change setelah implementasi selesai.

### Use Cases
- **Complete Change**: Tandai change sebagai selesai
- **Cleanup**: Pindahkan dari active ke archived
- **Documentation**: Preserve history untuk reference
- **Sprint End**: Archive semua completed changes

### Workflow
1. Verify change is complete (opsional tapi direkomendasikan)
2. Move dari `openspec/changes/<name>/`
3. Ke `openspec/archive/<name>/`
4. Update tracking files

### Output
- Change moved to archive
- Status updated
- Ready for next change

---

## 8. `/opsx-bulk-archive` - Bulk Archive

### Fungsi
Archive multiple completed changes sekaligus.

### Use Cases
- **Sprint Cleanup**: Archive semua changes dari sprint
- **Batch Operation**: Banyak changes selesai bersamaan
- **Release Prep**: Archive sebelum major release
- **Housekeeping**: Periodic cleanup

### Workflow
1. Identify semua completed changes
2. Batch archive operations
3. Update all tracking files

---

## 9. `/opsx-sync` - Sync Delta Specs

### Fungsi
Update main specs dengan changes dari delta spec, tanpa archive.

### Use Cases
- **Spec Update**: Sync spec changes ke main specs
- **Documentation**: Update docs tanpa archive change
- **Iteration**: Update spec setelah learning
- **Partial Complete**: Sync sebelum full archive

### Workflow
1. Compare delta spec dengan main spec
2. Apply changes ke main specs
3. Keep change active (tidak di-archive)
4. Update references

---

## Workflow Sequences

### Standard Workflow (Recommended)
```
/opsx-new → Describe → Artifact 1 → /opsx-continue → Artifact 2 → 
/opsx-continue → Artifact 3 → /opsx-continue → Artifact 4 → 
/opsx-apply → Implement → /opsx-verify → /opsx-archive
```

### Fast-Forward Workflow
```
/opsx-ff → Describe → [All Artifacts Generated] → 
/opsx-apply → Implement → /opsx-verify → /opsx-archive
```

### Exploration-First Workflow
```
/opsx-explore → Clarify requirements → Understand scope → 
/opsx-new → Standard workflow
```

### Iterative Workflow
```
/opsx-new → Artifact 1 → /opsx-explore (rethink) → 
Revise Artifact 1 → /opsx-continue → Next artifact...
```

---

## Decision Matrix

| Situation | Command | Reasoning |
|-----------|---------|-----------|
| Baru mulai, scope jelas | `/opsx-new` | Start proper workflow |
| Baru mulai, scope blur | `/opsx-explore` → `/opsx-new` | Clarify dulu |
| Change kecil, urgent | `/opsx-ff` | Fast track |
| Lanjut progress | `/opsx-continue` | Next artifact |
| Implementasi | `/opsx-apply` | Execute plan |
| Pre-complete check | `/opsx-verify` | Quality gate |
| Selesai | `/opsx-archive` | Finalize |
| Banyak selesai | `/opsx-bulk-archive` | Batch cleanup |
| Update specs | `/opsx-sync` | Sync tanpa archive |

---

## Best Practices

### 1. Selalu Mulai dengan `/opsx-new` atau `/opsx-explore`
- Jangan langsung coding tanpa spec
- Pahami requirements dulu

### 2. Gunakan `/opsx-ff` dengan Bijak
- Cocok untuk quick fixes
- Hindari untuk complex features
- Pastikan spec jelas sebelum ff

### 3. Verify Sebelum Archive
- Selalu `/opsx-verify` sebelum `/opsx-archive`
- Catch issues sebelum final

### 4. Archive Rutin
- Archive changes yang selesai
- Keep workspace clean
- Use `/opsx-bulk-archive` untuk batch

### 5. Explore untuk Ambiguity
- Kalau bingung, `/opsx-explore` dulu
- Lebih murah daripada rework

---

## File Structure

```
openspec/
├── changes/
│   └── <change-name>/
│       ├── proposal.md
│       ├── spec.md
│       ├── test-plan.md
│       └── implementation.md
├── archive/
│   └── <change-name>/
│       └── [same artifacts]
└── schemas/
    └── [workflow schemas]
```

---

## Compatibility

⚠️ **Requires**: OpenSpec CLI terinstall

Semua command `/opsx-*` memerlukan OpenSpec CLI yang properly configured.

---

## Summary

OpenSpec (OPSX) adalah framework **artifact-driven development** yang memastikan:

1. **Clarity**: Requirements jelas sebelum coding
2. **Tracking**: Progress tertracking di setiap artifact
3. **Quality**: Verification sebelum completion
4. **Documentation**: History tersimpan untuk reference
5. **Flexibility**: Bisa step-by-step atau fast-forward

**Core Philosophy**: *Think before you code, track while you code, verify after you code.*
