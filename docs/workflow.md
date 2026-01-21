# Development Workflow

This project uses:
- GitHub Flow
- Lightweight Scrum
- Continuous re-entry workflow

## Work cycle
1. Re-entry (`README_REENTRY.md`)
2. Check state (`PROJECT_STATE.md`)
3. Create/open issues for the active HU
4. Start services (`make -C ops up`)
5. Develop + tests + documentation
6. Open PR with DoR/DoD checklist
7. CI: lint + test (verify GitHub Actions are green)
8. Review PR → merge → update `Sprint_Log.md` and `PROJECT_STATE.md`

- Base branch: `develop` (feature branches start here; no direct commits on `develop`)
- Branch naming: `type/huNN-short-desc` (example: `feat/hu17-unify-suggestions-summary`)
- Flow: branch from `develop` → PR/merge back to `develop`; `main` updates only from `develop` at releases/checkpoints

## Scalability
This workflow supports additional collaborators with minimal changes.

## Audit Policy (Canonical)
- Default mode: NORMAL (warnings do not block work).
- Strict mode: run only before:
  - merging into canonical branches (e.g., develop/main), or
  - starting a large feature (contract/db/cross-cutting changes).

Definition of “large feature”:
- modifies API/event contracts
- touches DB/models/migrations
- includes mass renames/deletes (R/D)
- cross-layer refactors (routes/controllers/services/events/tests)
- introduces new external integration
