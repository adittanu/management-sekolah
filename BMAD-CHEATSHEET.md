# BMAD Commands Cheatsheet

> BMAD (Brownfield Multi-Agent Development) adalah framework untuk software development pada codebase existing dengan pendekatan multi-agent dan workflow terstruktur.

---

## Quick Reference

| Command | Fungsi | Kapan Digunakan |
|---------|--------|-----------------|
| `/bmad-bmm-workflow-init` | Inisialisasi workflow | Start BMAD pada project |
| `/bmad-bmm-workflow-status` | Check status | Lihat current state |
| `/bmad-bmm-create-product-brief` | Buat product brief | Definisikan product vision |
| `/bmad-bmm-prd` | Create/Edit PRD | Product requirements |
| `/bmad-bmm-create-ux-design` | UX Design | Plan UX patterns |
| `/bmad-bmm-create-architecture` | Architecture | Technical decisions |
| `/bmad-bmm-check-implementation-readiness` | Readiness check | Sebelum implementation |
| `/bmad-bmm-create-epics-and-stories` | Buat epics & stories | Breakdown requirements |
| `/bmad-bmm-create-story` | Create next story | Dari epics+stories |
| `/bmad-bmm-dev-story` | Execute story | Implement story |
| `/bmad-bmm-sprint-planning` | Sprint planning | Generate sprint status |
| `/bmad-bmm-sprint-status` | Sprint status | Summary & risks |
| `/bmad-bmm-code-review` | Code review | Review dengan adversarial approach |
| `/bmad-bmm-correct-course` | Navigate changes | Handle significant changes |
| `/bmad-bmm-retrospective` | Retrospective | Post-epic review |
| `/bmad-bmm-document-project` | Document project | Brownfield documentation |
| `/bmad-bmm-generate-project-context` | Generate context | AI agent context rules |
| `/bmad-core-brainstorming` | Brainstorming | Interactive ideation |
| `/bmad-core-party-mode` | Party mode | Multi-agent conversation |
| `/bmad-task-core-index-docs` | Index docs | Generate/update index |
| `/bmad-task-core-shard-doc` | Shard document | Split large documents |

### Diagram Commands

| Command | Fungsi | Output |
|---------|--------|--------|
| `/bmad-bmm-create-excalidraw-diagram` | System architecture | `.excalidraw` |
| `/bmad-bmm-create-excalidraw-erd` | Entity Relationship | `.excalidraw` |
| `/bmad-bmm-create-excalidraw-dataflow` | Data Flow Diagram | `.excalidraw` |
| `/bmad-bmm-create-excalidraw-flowchart` | Flowchart | `.excalidraw` |
| `/bmad-bmm-create-excalidraw-wireframe` | Wireframes | `.excalidraw` |

### Test Architecture Commands

| Command | Fungsi | Phase |
|---------|--------|-------|
| `/bmad-bmm-testarch-test-design` | Test design | Solutioning/Implementation |
| `/bmad-bmm-testarch-atdd` | ATDD tests | Pre-implementation |
| `/bmad-bmm-testarch-framework` | Test framework | Setup |
| `/bmad-bmm-testarch-automate` | Test automation | Post-implementation |
| `/bmad-bmm-testarch-test-review` | Test review | Quality gate |
| `/bmad-bmm-testarch-trace` | Traceability matrix | Validation |
| `/bmad-bmm-testarch-nfr` | NFR assessment | Pre-release |
| `/bmad-bmm-testarch-ci` | CI/CD pipeline | Setup |

### Research Commands

| Command | Fungsi | Scope |
|---------|--------|-------|
| `/bmad-bmm-research` | Comprehensive research | Multi-domain |
| `/bmad-bmm-research-market` | Market research | Business |
| `/bmad-bmm-research-technical` | Technical research | Technology |
| `/bmad-bmm-research-domain` | Domain research | Industry |

### Quick Dev Commands

| Command | Fungsi | Use Case |
|---------|--------|----------|
| `/bmad-bmm-quick-spec` | Conversational spec | Quick planning |
| `/bmad-bmm-quick-dev` | Flexible development | Execute specs/instructions |

---

## 1. `/bmad-bmm-workflow-init` - Inisialisasi Workflow

### Fungsi
Initialize BMAD workflow pada project.

### Output
- `_bmad/` directory structure
- Workflow configuration
- Status tracking files

### Workflow Levels
1. **Level 1**: Basic - PRD → Stories → Dev
2. **Level 2**: Standard - Adds Architecture, UX
3. **Level 3**: Complete - Full test architecture, CI/CD

### Contoh
```
/bmad-bmm-workflow-init
→ Level: 3 (Complete)
→ Type: Web Application
→ Created: _bmad/ structure
```

---

## 2. `/bmad-bmm-workflow-status` - Check Status

### Fungsi
Lightweight status checker - answers "what should I do now?"

### Output
- Current workflow phase
- Completed artifacts
- Next recommended action
- Blockers (if any)

---

## 3. `/bmad-bmm-create-product-brief` - Product Brief

### Fungsi
Create comprehensive product brief melalui collaborative discovery.

### Output
`_bmad/01-product-brief.md`

### Content
- Problem statement
- Target users
- Value proposition
- Success metrics
- Constraints
- Timeline

### Approach
Collaborative step-by-step discovery sebagai Business Analyst peer.

---

## 4. `/bmad-bmm-prd` - Product Requirements Document

### Fungsi
Create, validate, atau edit PRD dengan tri-modal workflow.

### Modes
1. **Create**: Buat PRD baru dari product brief
2. **Validate**: Review PRD existing untuk completeness
3. **Edit**: Modifikasi PRD dengan change tracking

### Output
`_bmad/02-prd.md`

### Content
- Feature specifications
- User stories
- Acceptance criteria
- Non-functional requirements
- Out-of-scope

### Contoh
```
/bmad-bmm-prd
→ Mode: Create
→ Input: 01-product-brief.md
→ Output: 02-prd.md
```

---

## 5. `/bmad-bmm-create-ux-design` - UX Design

### Fungsi
Plan UX patterns, look and feel dengan UX Design expert.

### Output
`_bmad/03-ux-design.md`

### Content
- Design system
- Component patterns
- User flows
- Accessibility guidelines
- Responsive breakpoints

### Approach
Collaborative peer session dengan UX designer.

---

## 6. `/bmad-bmm-create-architecture` - Architecture

### Fungsi
Collaborative architectural decision facilitation.

### Output
`_bmad/04-architecture.md`

### Content
- System components
- Data flow
- API design
- Database schema
- Security considerations
- Scalability approach

### Approach
Intelligent, adaptive conversation untuk architectural decisions.

---

## 7. `/bmad-bmm-check-implementation-readiness` - Readiness Check

### Fungsi
Critical validation sebelum implementation.

### Checks
- PRD completeness
- Architecture alignment
- Epics & Stories quality
- Test strategy
- Risk assessment

### Output
Readiness report dengan PASS/CONCERNS/FAIL.

### Contoh
```
/bmad-bmm-check-implementation-readiness
→ PRD: ✓ Complete
→ Architecture: ✓ Aligned
→ Stories: ⚠ Needs refinement
→ Result: CONCERNS
```

---

## 8. `/bmad-bmm-create-epics-and-stories` - Epics & Stories

### Fungsi
Transform PRD requirements dan Architecture ke comprehensive stories.

### Output
`_bmad/05-epics-and-stories.md`

### Content
- Epics organized by user value
- User stories dengan acceptance criteria
- Story points (optional)
- Dependencies
- Priority

### Requirements
- PRD harus complete
- Architecture harus finalized
- UX Design (recommended jika UI exists)

---

## 9. `/bmad-bmm-create-story` - Create Next Story

### Fungsi
Create next user story dari epics+stories dengan context analysis.

### Output
Individual story file di `_bmad/stories/`

### Features
- Enhanced context analysis
- Ready-for-dev marking
- Dependency tracking

### Contoh
```
/bmad-bmm-create-story
→ Analyzing: 05-epics-and-stories.md
→ Next: Story-007
→ Context: User authentication flow
→ Status: Ready for dev
```

---

## 10. `/bmad-bmm-dev-story` - Execute Story

### Fungsi
Execute story dengan implement tasks, tests, validation.

### Workflow
1. Read story file
2. Implement tasks/subtasks
3. Write tests
4. Validate acceptance criteria
5. Update story status

### Output
- Implemented code
- Tests
- Updated story file
- Implementation notes

---

## 11. `/bmad-bmm-sprint-planning` - Sprint Planning

### Fungsi
Generate sprint status tracking file.

### Output
`_bmad/sprint-status.yaml`

### Content
- Epics breakdown
- Stories dengan status
- Assigned developers
- Sprint goals
- Capacity planning

---

## 12. `/bmad-bmm-sprint-status` - Sprint Status

### Fungsi
Summarize sprint-status.yaml, surface risks, route ke implementation.

### Output
- Progress summary
- Risk identification
- Blockers
- Recommendations

---

## 13. `/bmad-bmm-code-review` - Code Review

### Fungsi
Adversarial senior developer code review.

### Approach
- Find 3-10 specific problems
- Challenge everything
- Code quality, test coverage, architecture, security, performance
- NEVER accepts "looks good"
- Can auto-fix dengan user approval

### Output
Code review report dengan:
- Issues found
- Severity
- Recommendations
- Auto-fix suggestions

---

## 14. `/bmad-bmm-correct-course` - Navigate Changes

### Fungsi
Handle significant changes during sprint execution.

### Use Cases
- Scope changes
- Technical blockers
- Requirement changes
- Architecture pivots

### Output
- Impact analysis
- Proposed solutions
- Routing untuk implementation

---

## 15. `/bmad-bmm-retrospective` - Retrospective

### Fungsi
Run after epic completion untuk review success dan lessons learned.

### Output
Retrospective document dengan:
- What went well
- What didn't go well
- Lessons learned
- Action items
- Impact on next epic

---

## 16. `/bmad-bmm-document-project` - Document Project

### Fungsi
Analyze dan document brownfield projects.

### Output
Comprehensive reference documentation:
- System overview
- Architecture
- Code patterns
- Dependencies
- Deployment

### Use Case
Project yang sudah ada codebase tapi kurang dokumentasi.

---

## 17. `/bmad-bmm-generate-project-context` - Generate Context

### Fungsi
Create concise `project-context.md` dengan critical rules untuk AI agents.

### Output
`project-context.md`

### Content
- Critical rules
- Patterns yang harus diikuti
- Conventions
- Anti-patterns

### Use Case
Onboarding AI agents ke project dengan cepat.

---

## 18. Diagram Commands

### `/bmad-bmm-create-excalidraw-diagram`
Create system architecture diagrams.

### `/bmad-bmm-create-excalidraw-erd`
Create Entity Relationship Diagrams.

### `/bmad-bmm-create-excalidraw-dataflow`
Create Data Flow Diagrams (DFD).

### `/bmad-bmm-create-excalidraw-flowchart`
Create flowcharts untuk processes, pipelines, logic flows.

### `/bmad-bmm-create-excalidraw-wireframe`
Create website atau app wireframes.

### Output
Semua commands generate `.excalidraw` files yang bisa dibuka di excalidraw.com.

---

## 19. Test Architecture Commands

### `/bmad-bmm-testarch-test-design`
Dual-mode: System-level testability review (Solutioning) atau Epic-level test planning (Implementation).

### `/bmad-bmm-testarch-atdd`
Generate failing acceptance tests before implementation (TDD red-green-refactor).

### `/bmad-bmm-testarch-framework`
Initialize production-ready test framework (Playwright/Cypress).

### `/bmad-bmm-testarch-automate`
Expand test automation coverage setelah implementation.

### `/bmad-bmm-testarch-test-review`
Review test quality dengan best practices validation.

### `/bmad-bmm-testarch-trace`
Generate requirements-to-tests traceability matrix.

### `/bmad-bmm-testarch-nfr`
Assess non-functional requirements (performance, security, reliability).

### `/bmad-bmm-testarch-ci`
Scaffold CI/CD quality pipeline.

---

## 20. Research Commands

### `/bmad-bmm-research`
Comprehensive research across multiple domains.

### `/bmad-bmm-research-market`
Market research: competitors, trends, opportunities.

### `/bmad-bmm-research-technical`
Technical research: stack, libraries, patterns.

### `/bmad-bmm-research-domain`
Domain research: industry-specific knowledge.

---

## 21. Quick Dev Commands

### `/bmad-bmm-quick-spec`
Conversational spec engineering dengan questions dan investigation.

### `/bmad-bmm-quick-dev`
Flexible development: execute tech-specs atau direct instructions.

---

## 22. Utility Commands

### `/bmad-core-brainstorming`
Interactive brainstorming dengan diverse creative techniques.

### `/bmad-core-party-mode`
Orchestrates group discussions antara all BMAD agents.

### `/bmad-task-core-index-docs`
Generate/update `index.md` untuk directory.

### `/bmad-task-core-shard-doc`
Split large markdown documents into smaller files.

---

## Workflow Sequences

### Standard BMAD Workflow
```
/bmad-bmm-workflow-init                    → Initialize
/bmad-bmm-create-product-brief             → Product vision
/bmad-bmm-prd (mode: create)               → Requirements
/bmad-bmm-create-ux-design                 → UX patterns
/bmad-bmm-create-architecture              → Technical design
/bmad-bmm-check-implementation-readiness   → Validate
/bmad-bmm-create-epics-and-stories         → Breakdown
/bmad-bmm-sprint-planning                  → Plan sprint
/bmad-bmm-create-story                     → Next story
/bmad-bmm-dev-story                        → Implement
/bmad-bmm-code-review                      → Review
/bmad-bmm-retrospective                    → Reflect
```

### Brownfield Workflow
```
/bmad-bmm-workflow-init                    → Initialize
/bmad-bmm-document-project                 → Analyze existing
/bmad-bmm-generate-project-context         → AI context
[Continue dengan standard workflow]
```

### Test-First Workflow
```
/bmad-bmm-testarch-test-design             → Test strategy
/bmad-bmm-testarch-atdd                    → Failing tests
/bmad-bmm-dev-story                        → Implement
/bmad-bmm-testarch-test-review             → Review tests
```

### Quick Fix Workflow
```
/bmad-bmm-quick-spec                       → Quick plan
/bmad-bmm-quick-dev                        → Execute
```

---

## Decision Matrix

| Situation | Command | Reasoning |
|-----------|---------|-----------|
| Start BMAD | `/bmad-bmm-workflow-init` | Initialize |
| Check status | `/bmad-bmm-workflow-status` | What's next? |
| Product vision | `/bmad-bmm-create-product-brief` | Define product |
| Requirements | `/bmad-bmm-prd` | PRD create/edit/validate |
| UX planning | `/bmad-bmm-create-ux-design` | Design patterns |
| Architecture | `/bmad-bmm-create-architecture` | Technical decisions |
| Pre-dev check | `/bmad-bmm-check-implementation-readiness` | Validate ready |
| Breakdown | `/bmad-bmm-create-epics-and-stories` | Stories |
| Next story | `/bmad-bmm-create-story` | Pick next |
| Implement | `/bmad-bmm-dev-story` | Execute |
| Sprint plan | `/bmad-bmm-sprint-planning` | Plan sprint |
| Sprint status | `/bmad-bmm-sprint-status` | Progress |
| Code review | `/bmad-bmm-code-review` | Quality gate |
| Changes | `/bmad-bmm-correct-course` | Navigate change |
| Retro | `/bmad-bmm-retrospective` | Learn |
| Document | `/bmad-bmm-document-project` | Brownfield docs |
| AI context | `/bmad-bmm-generate-project-context` | Agent rules |
| Brainstorm | `/bmad-core-brainstorming` | Ideation |
| Multi-agent | `/bmad-core-party-mode` | Discussion |
| Architecture diagram | `/bmad-bmm-create-excalidraw-diagram` | Visualize |
| ERD | `/bmad-bmm-create-excalidraw-erd` | Data model |
| Data flow | `/bmad-bmm-create-excalidraw-dataflow` | DFD |
| Flowchart | `/bmad-bmm-create-excalidraw-flowchart` | Process |
| Wireframe | `/bmad-bmm-create-excalidraw-wireframe` | UI mockup |
| Test strategy | `/bmad-bmm-testarch-test-design` | Plan tests |
| ATDD | `/bmad-bmm-testarch-atdd` | TDD approach |
| Test framework | `/bmad-bmm-testarch-framework` | Setup |
| Test automation | `/bmad-bmm-testarch-automate` | Coverage |
| Test review | `/bmad-bmm-testarch-test-review` | Quality |
| Traceability | `/bmad-bmm-testarch-trace` | Validation |
| NFR check | `/bmad-bmm-testarch-nfr` | Pre-release |
| CI/CD | `/bmad-bmm-testarch-ci` | Pipeline |
| Research | `/bmad-bmm-research` | Investigation |
| Market research | `/bmad-bmm-research-market` | Business |
| Technical research | `/bmad-bmm-research-technical` | Tech |
| Domain research | `/bmad-bmm-research-domain` | Industry |
| Quick spec | `/bmad-bmm-quick-spec` | Fast planning |
| Quick dev | `/bmad-bmm-quick-dev` | Fast execution |
| Index docs | `/bmad-task-core-index-docs` | Organization |
| Shard doc | `/bmad-task-core-shard-doc` | Split large docs |

---

## File Structure

```
_bmad/
├── 01-product-brief.md           # Product vision
├── 02-prd.md                     # Requirements
├── 03-ux-design.md               # UX patterns
├── 04-architecture.md            # Technical design
├── 05-epics-and-stories.md       # Story breakdown
├── sprint-status.yaml            # Sprint tracking
├── project-context.md            # AI agent rules
├── stories/                      # Individual stories
│   ├── story-001.md
│   ├── story-002.md
│   └── ...
├── diagrams/                     # Excalidraw files
│   ├── architecture.excalidraw
│   ├── erd.excalidraw
│   └── ...
├── tests/                        # Test artifacts
│   ├── atdd/
│   ├── traceability/
│   └── nfr/
└── _status/                      # Workflow status
    └── status.yaml
```

---

## Workflow Levels

### Level 1: Basic
- Product Brief
- PRD
- Epics & Stories
- Development

### Level 2: Standard
- Level 1 +
- UX Design
- Architecture
- Code Review

### Level 3: Complete
- Level 2 +
- Test Architecture
- CI/CD Pipeline
- NFR Assessment

---

## Best Practices

### 1. Selalu Mulai dengan `/bmad-bmm-workflow-init`
- Tentukan level yang sesuai
- Setup directory structure

### 2. Complete Prerequisites
- Product Brief sebelum PRD
- PRD + Architecture sebelum Epics
- Readiness check sebelum dev

### 3. Gunakan Adversarial Review
- `/bmad-bmm-code-review` selalu
- Minimum 3 issues found
- Auto-fix dengan approval

### 4. Test-First Approach
- `/bmad-bmm-testarch-atdd` untuk TDD
- Generate failing tests first
- Implement sampai pass

### 5. Document Visual
- Gunakan Excalidraw commands
- Architecture, ERD, Data Flow
- Wireframes untuk UI

### 6. Retrospective Rutin
- Setiap epic completion
- Extract lessons learned
- Apply ke next epic

### 7. Brownfield Strategy
- `/bmad-bmm-document-project` untuk analyze
- `/bmad-bmm-generate-project-context` untuk AI context
- Lanjutkan dengan standard workflow

---

## Summary

BMAD (Brownfield Multi-Agent Development) adalah framework untuk software development pada codebase existing dengan:

1. **Multi-Agent**: Specialized agents untuk setiap task
2. **Structured Workflow**: Phases dari product brief sampai retrospective
3. **Adversarial Review**: Code review yang challenging
4. **Test Architecture**: Comprehensive testing strategy
5. **Visual Documentation**: Excalidraw integration
6. **Flexibility**: Standard, quick, dan brownfield paths

**Core Philosophy**: *Analyze before you plan, plan before you code, review after you code, learn after you ship.*

---

## Comparison: BMAD vs GSD vs OPSX

| Aspek | BMAD | GSD | OPSX |
|-------|------|-----|------|
| **Target** | Brownfield (existing code) | Greenfield/Brownfield | Any (artifact-driven) |
| **Approach** | Multi-agent, story-based | Hierarchical phases | Artifact-driven workflow |
| **Planning** | Epics & Stories | Phase-based plans | Change artifacts |
| **Review** | Adversarial code review | Verification | Artifact verification |
| **Testing** | Full test architecture | Phase verification | Test plans |
| **Visual** | Excalidraw diagrams | - | - |
| **Best For** | Existing codebase projects | Solo agentic development | Structured changes |

---

## Getting Help

- Run `/bmad-bmm-workflow-status` untuk current state
- Check `_bmad/` directory untuk artifacts
- Use `/bmad-core-party-mode` untuk multi-agent discussion
