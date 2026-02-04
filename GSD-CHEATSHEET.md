# GSD Command Cheatsheet

> GSD (Get Shit Done) adalah framework untuk hierarchical project planning yang dioptimalkan untuk solo agentic development dengan Claude Code.

---

## Quick Reference

| Command | Fungsi | Kapan Digunakan |
|---------|--------|-----------------|
| `/gsd-new-project` | Inisialisasi project baru | Memulai project dari nol |
| `/gsd-map-codebase` | Mapping codebase existing | Brownfield projects |
| `/gsd-discuss-phase <n>` | Diskusi phase sebelum planning | Clarify vision untuk phase |
| `/gsd-research-phase <n>` | Research ekosistem | Domain kompleks/niche |
| `/gsd-list-phase-assumptions <n>` | Lihat asumsi Claude | Verifikasi approach |
| `/gsd-plan-phase <n>` | Buat execution plan | Planning phase detail |
| `/gsd-execute-phase <n>` | Eksekusi phase | Jalankan semua plans |
| `/gsd-quick` | Quick task execution | Task kecil yang jelas |
| `/gsd-add-phase <desc>` | Tambah phase baru | Menambah work ke roadmap |
| `/gsd-insert-phase <after> <desc>` | Insert phase di tengah | Urgent work mid-milestone |
| `/gsd-remove-phase <n>` | Hapus phase | Remove future phase |
| `/gsd-new-milestone <name>` | Milestone baru | Start next major version |
| `/gsd-complete-milestone <v>` | Complete milestone | Archive & tag release |
| `/gsd-progress` | Check status | Lihat progress & next action |
| `/gsd-resume-work` | Resume session | Lanjut dari pause |
| `/gsd-pause-work` | Pause session | Context handoff |
| `/gsd-debug [desc]` | Debug systematic | Investigasi issue |
| `/gsd-add-todo [desc]` | Capture todo | Simpan ide/task |
| `/gsd-check-todos [area]` | Review todos | Kerjakan pending todos |
| `/gsd-verify-work [phase]` | UAT validation | Verifikasi deliverables |
| `/gsd-audit-milestone [v]` | Audit milestone | Check completion |
| `/gsd-plan-milestone-gaps` | Plan gap closure | Tutup gaps dari audit |
| `/gsd-settings` | Konfigurasi | Toggle agents & profile |
| `/gsd-set-profile <p>` | Switch profile | quality/balanced/budget |
| `/gsd-help` | Show reference | Lihat cheatsheet ini |
| `/gsd-update` | Update GSD | Latest version |
| `/gsd-join-discord` | Join community | Discord GSD |

---

## 1. `/gsd-new-project` - Inisialisasi Project

### Fungsi
Initialize new project melalui unified flow lengkap.

### Output
- `.planning/PROJECT.md` — project vision
- `.planning/config.json` — workflow mode
- `.planning/REQUIREMENTS.md` — scoped requirements
- `.planning/ROADMAP.md` — phase breakdown
- `.planning/STATE.md` — project memory
- `.planning/research/` — domain research (optional)

### Workflow
1. Deep questioning untuk understand requirements
2. Optional: 4 parallel researcher agents
3. Requirements definition dengan v1/v2/out-of-scope
4. Roadmap creation dengan phase breakdown

### Contoh
```
/gsd-new-project
→ "Saya mau buat school management system"
→ Research: education tech stack
→ Requirements: REQ-001 sampai REQ-015
→ Roadmap: 5 phases
```

---

## 2. `/gsd-map-codebase` - Mapping Existing Code

### Fungsi
Analyze existing codebase untuk brownfield projects.

### Output
`.planning/codebase/` dengan 7 dokumen:
- `STACK.md` — languages, frameworks, dependencies
- `ARCHITECTURE.md` — patterns, layers, data flow
- `STRUCTURE.md` — directory layout, key files
- `CONVENTIONS.md` — coding standards, naming
- `TESTING.md` — test setup, patterns
- `INTEGRATIONS.md` — external services, APIs
- `CONCERNS.md` — tech debt, known issues

### Use Case
Gunakan sebelum `/gsd-new-project` untuk project yang sudah ada codebase-nya.

---

## 3. `/gsd-discuss-phase <number>` - Diskusi Phase

### Fungsi
Help articulate vision untuk phase sebelum planning.

### Use Cases
- Punya ide tentang bagaimana phase harus berjalan
- Mau clarify essentials dan boundaries
- Belum yakin scope phase

### Output
`CONTEXT.md` dengan:
- Your vision
- Essentials
- Boundaries
- Success criteria

### Contoh
```
/gsd-discuss-phase 2
→ "Phase 2 ini saya bayangkan ada dashboard admin..."
→ Context captured untuk planning
```

---

## 4. `/gsd-research-phase <number>` - Research Ekosistem

### Fungsi
Comprehensive ecosystem research untuk niche/complex domains.

### Use Cases
- 3D, games, audio, shaders, ML
- Specialized domains
- Butuh tahu "how experts build this"

### Output
`RESEARCH.md` dengan:
- Standard stack
- Architecture patterns
- Common pitfalls
- Best practices

### Contoh
```
/gsd-research-phase 3
→ Domain: Real-time collaboration
→ Stack: WebRTC, Socket.io, CRDT
→ Patterns: Operational transform
```

---

## 5. `/gsd-list-phase-assumptions <number>` - Lihat Asumsi

### Fungsi
Lihat apa yang Claude planning untuk lakukan sebelum mulai.

### Use Cases
- Verifikasi approach
- Course-correct kalau misunderstood
- Align expectations

### Output
Conversational output — no files created.

---

## 6. `/gsd-plan-phase <number>` - Create Execution Plan

### Fungsi
Buat detailed execution plan untuk specific phase.

### Output
`.planning/phases/XX-phase-name/XX-YY-PLAN.md`

### Structure Plan
- Tasks dengan dependencies
- Wave grouping (parallel execution)
- Verification criteria
- Success measures

### Contoh
```
/gsd-plan-phase 1
→ Creates: .planning/phases/01-foundation/01-01-PLAN.md
→ Multiple plans: 01-01, 01-02, etc.
```

---

## 7. `/gsd-execute-phase <number>` - Eksekusi Phase

### Fungsi
Execute semua plans dalam phase.

### Workflow
1. Group plans by wave (dari frontmatter)
2. Execute waves sequentially
3. Plans dalam wave run parallel via Task tool
4. Verify phase goal setelah complete
5. Update REQUIREMENTS.md, ROADMAP.md, STATE.md

### Contoh
```
/gsd-execute-phase 5
→ Wave 1: Setup, Config (parallel)
→ Wave 2: Core features (parallel)
→ Wave 3: Integration (parallel)
→ Verification
```

---

## 8. `/gsd-quick` - Quick Task Execution

### Fungsi
Execute small, ad-hoc tasks dengan GSD guarantees tapi skip optional agents.

### Path
- Spawns: planner + executor
- Skips: researcher, checker, verifier

### Output
`.planning/quick/NNN-slug/`
- `PLAN.md`
- `SUMMARY.md`

### Use Case
Task kecil yang scope jelas, tidak perlu research atau verification.

---

## 9. `/gsd-add-phase <description>` - Tambah Phase

### Fungsi
Add new phase ke end of current milestone.

### Output
- Appends ke ROADMAP.md
- Next sequential number
- Phase directory structure

### Contoh
```
/gsd-add-phase "Add admin dashboard"
→ Phase 6: Add admin dashboard
```

---

## 10. `/gsd-insert-phase <after> <description>` - Insert Phase

### Fungsi
Insert urgent work sebagai decimal phase di tengah.

### Use Cases
- Critical bug fix mid-milestone
- Discovered work yang harus dilakukan
- Maintain phase ordering

### Contoh
```
/gsd-insert-phase 7 "Fix critical auth bug"
→ Creates Phase 7.1
→ Between 7 dan 8
```

---

## 11. `/gsd-remove-phase <number>` - Hapus Phase

### Fungsi
Remove future phase dan renumber subsequent phases.

### ⚠️ Constraints
- Hanya untuk future (unstarted) phases
- Git commit preserves historical record

### Contoh
```
/gsd-remove-phase 17
→ Phase 17 deleted
→ 18-20 menjadi 17-19
```

---

## 12. `/gsd-new-milestone <name>` - Milestone Baru

### Fungsi
Start new milestone melalui unified flow.

### Mirrors `/gsd-new-project` untuk brownfield.

### Output
Sama seperti `/gsd-new-project` tapi untuk next major version.

### Contoh
```
/gsd-new-milestone "v2.0 Features"
→ New milestone dengan research, requirements, roadmap
```

---

## 13. `/gsd-complete-milestone <version>` - Complete Milestone

### Fungsi
Archive completed milestone dan prepare untuk next version.

### Output
- `MILESTONES.md` entry dengan stats
- Archive ke `milestones/` directory
- Git tag untuk release

### Contoh
```
/gsd-complete-milestone 1.0.0
→ Tagged: v1.0.0
→ Archived dengan stats
```

---

## 14. `/gsd-progress` - Check Status

### Fungsi
Check project status dan intelligently route ke next action.

### Output
- Visual progress bar
- Completion percentage
- Recent work summary
- Current position
- Next actions
- Key decisions
- Open issues

---

## 15. `/gsd-resume-work` - Resume Session

### Fungsi
Resume work dari previous session dengan full context restoration.

### Output
- Reads STATE.md
- Shows current position
- Recent progress
- Next actions

---

## 16. `/gsd-pause-work` - Pause Session

### Fungsi
Create context handoff ketika pause mid-phase.

### Output
- `.continue-here` file
- STATE.md updated
- In-progress context captured

---

## 17. `/gsd-debug [issue]` - Systematic Debugging

### Fungsi
Systematic debugging dengan persistent state.

### Features
- Survives `/clear`
- Resume dengan `/gsd-debug` (no args)
- Scientific method: evidence → hypothesis → test

### Output
`.planning/debug/[slug].md`

### Contoh
```
/gsd-debug "login button doesn't work"
→ Investigation tracked
/clear
/gsd-debug
→ Resume dari where you left off
```

---

## 18. `/gsd-add-todo [desc]` - Capture Todo

### Fungsi
Capture idea atau task dari conversation.

### Features
- Infers context dari conversation
- Creates structured todo
- Checks duplicates
- Updates STATE.md

### Output
`.planning/todos/pending/[slug].md`

### Contoh
```
/gsd-add-todo
→ Infers dari conversation

/gsd-add-todo "Fix modal z-index"
→ Explicit description
```

---

## 19. `/gsd-check-todos [area]` - Review Todos

### Fungsi
List pending todos dan select satu untuk dikerjakan.

### Features
- Filter by area (e.g., `api`, `ui`)
- Load full context
- Route ke appropriate action
- Move ke `done/` ketika worked on

### Contoh
```
/gsd-check-todos
→ List all pending

/gsd-check-todos api
→ Filter by area
```

---

## 20. `/gsd-verify-work [phase]` - UAT Validation

### Fungsi
Validate built features melalui conversational UAT.

### Features
- Extracts testable deliverables dari SUMMARY.md
- One test at a time (yes/no)
- Auto-diagnose failures
- Create fix plans

---

## 21. `/gsd-audit-milestone [version]` - Audit Milestone

### Fungsi
Audit milestone completion against original intent.

### Output
`MILESTONE-AUDIT.md` dengan:
- Requirements coverage
- Cross-phase wiring
- Gaps dan tech debt

---

## 22. `/gsd-plan-milestone-gaps` - Plan Gap Closure

### Fungsi
Create phases untuk close gaps dari audit.

### Output
- Groups gaps into phases
- Prioritizes by must/should/nice
- Adds ke ROADMAP.md

---

## 23. `/gsd-settings` - Konfigurasi

### Fungsi
Configure workflow toggles dan model profile.

### Options
- Toggle: researcher, plan checker, verifier
- Profile: quality / balanced / budget

### Output
Updates `.planning/config.json`

---

## 24. `/gsd-set-profile <profile>` - Switch Profile

### Profiles
| Profile | Deskripsi |
|---------|-----------|
| `quality` | Opus everywhere except verification |
| `balanced` | Opus planning, Sonnet execution (default) |
| `budget` | Sonnet writing, Haiku research/verification |

### Contoh
```
/gsd-set-profile budget
```

---

## Workflow Sequences

### Standard Workflow
```
/gsd-new-project        → Inisialisasi
/gsd-plan-phase 1       → Planning
/gsd-execute-phase 1    → Execution
/gsd-verify-work 1      → UAT
/gsd-complete-milestone → Archive
```

### Brownfield Workflow
```
/gsd-map-codebase       → Analyze existing
/gsd-new-project        → Requirements
/gsd-plan-phase 1       → Planning
/gsd-execute-phase 1    → Execution
```

### Quick Fix Workflow
```
/gsd-quick              → Quick task
→ Implement
→ Done
```

### Debug Workflow
```
/gsd-debug "issue"      → Start debug
→ Investigation
/clear
/gsd-debug              → Resume
```

### Todo Workflow
```
/gsd-add-todo "task"    → Capture
/gsd-check-todos        → Review
→ Select & work
```

---

## Decision Matrix

| Situation | Command | Reasoning |
|-----------|---------|-----------|
| Project baru | `/gsd-new-project` | Full initialization |
| Existing codebase | `/gsd-map-codebase` → `/gsd-new-project` | Analyze dulu |
| Clarify phase vision | `/gsd-discuss-phase` | Capture intent |
| Domain kompleks | `/gsd-research-phase` | Expert knowledge |
| Verify approach | `/gsd-list-phase-assumptions` | Align expectations |
| Planning phase | `/gsd-plan-phase` | Create plan |
| Execute phase | `/gsd-execute-phase` | Run plans |
| Task kecil | `/gsd-quick` | Skip ceremony |
| Tambah work | `/gsd-add-phase` | Extend roadmap |
| Urgent mid-milestone | `/gsd-insert-phase` | Insert decimal |
| Hapus phase | `/gsd-remove-phase` | Cleanup |
| Next version | `/gsd-new-milestone` | New milestone |
| Release | `/gsd-complete-milestone` | Archive & tag |
| Check status | `/gsd-progress` | Status & routing |
| Resume | `/gsd-resume-work` | Continue session |
| Pause | `/gsd-pause-work` | Handoff context |
| Debug | `/gsd-debug` | Systematic fix |
| Capture idea | `/gsd-add-todo` | Save for later |
| Review tasks | `/gsd-check-todos` | Work on pending |
| UAT | `/gsd-verify-work` | Validate |
| Audit | `/gsd-audit-milestone` | Check completion |
| Fix gaps | `/gsd-plan-milestone-gaps` | Close gaps |

---

## File Structure

```
.planning/
├── PROJECT.md            # Project vision
├── ROADMAP.md            # Current phase breakdown
├── STATE.md              # Project memory & context
├── config.json           # Workflow mode & gates
├── REQUIREMENTS.md       # Scoped requirements dengan REQ-IDs
├── MILESTONES.md         # Completed milestones
├── MILESTONE-AUDIT.md    # Audit results
├── todos/                # Captured ideas and tasks
│   ├── pending/          # Todos waiting
│   └── done/             # Completed todos
├── debug/                # Active debug sessions
│   └── resolved/         # Archived resolved issues
├── codebase/             # Codebase map (brownfield)
│   ├── STACK.md
│   ├── ARCHITECTURE.md
│   ├── STRUCTURE.md
│   ├── CONVENTIONS.md
│   ├── TESTING.md
│   ├── INTEGRATIONS.md
│   └── CONCERNS.md
├── quick/                # Quick tasks
│   └── NNN-slug/
│       ├── PLAN.md
│       └── SUMMARY.md
└── phases/
    ├── 01-foundation/
    │   ├── 01-01-PLAN.md
    │   ├── 01-01-SUMMARY.md
    │   └── 01-02-PLAN.md
    └── 02-core-features/
        ├── 02-01-PLAN.md
        └── 02-01-SUMMARY.md
```

---

## Workflow Modes

### Interactive Mode
- Confirms each major decision
- Pauses at checkpoints
- More guidance

### YOLO Mode
- Auto-approves most decisions
- Executes without confirmation
- Only stops for critical checkpoints

### Change Mode
Edit `.planning/config.json` untuk switch.

---

## Planning Configuration

### `planning.commit_docs` (default: `true`)
- `true`: Planning artifacts committed ke git
- `false`: Local-only, not committed

### `planning.search_gitignored` (default: `false`)
- `true`: Include `.planning/` dalam searches
- Gunakan kalau `.planning/` di-gitignore

### Example config.json
```json
{
  "planning": {
    "commit_docs": false,
    "search_gitignored": true
  },
  "profile": "balanced",
  "agents": {
    "researcher": true,
    "plan_checker": true,
    "verifier": true
  }
}
```

---

## Best Practices

### 1. Selalu Mulai dengan `/gsd-new-project`
- Jangan langsung coding
- Pahami requirements dulu

### 2. Gunakan `/gsd-quick` dengan Bijak
- Cocok untuk task kecil
- Hindari untuk complex features

### 3. Verify Sebelum Complete
- `/gsd-verify-work` sebelum milestone complete
- Catch issues early

### 4. Archive Rutin
- `/gsd-archive` untuk changes selesai
- `/gsd-bulk-archive` untuk batch
- Keep workspace clean

### 5. Debug Systematic
- `/gsd-debug` untuk issues
- Survives context resets
- Scientific method

### 6. Capture Ideas
- `/gsd-add-todo` untuk ideas
- `/gsd-check-todos` untuk review
- Jangan kehilangan ideas

---

## Update GSD

```bash
npx get-shit-done-cc@latest
```

Atau:

```
/gsd-update
```

---

## Summary

GSD (Get Shit Done) adalah framework **hierarchical project planning** yang memastikan:

1. **Clarity**: Requirements jelas sebelum coding
2. **Planning**: Detailed execution plans
3. **Tracking**: Progress tertracking per phase
4. **Quality**: Verification sebelum completion
5. **Documentation**: History tersimpan
6. **Flexibility**: Step-by-step atau quick mode

**Core Philosophy**: *Plan before you code, track while you code, verify after you code.*

---

## Community

Join Discord: `/gsd-join-discord`

Get help, share projects, stay updated.
