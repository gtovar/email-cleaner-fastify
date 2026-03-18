# README_REENTRY.md — Email Cleaner & Smart Notifications (Fastify Backend)

> Goal: restore context in 1–2 minutes without reading long docs.

## 0) Re-entry checklist (strict order)

1) Check branch + status (prefer feature branch from `develop` per workflow):
   - `git status -sb`
2) Run tests (strong truth):
   - `npm test`
3) Open the checkpoint:
   - `PROJECT_STATE.md` (factual state)
4) If something looks off:
   - Verify in `src/index.js`, `src/routes/*`, `src/services/*`, `src/events/*`, `tests/*`

---

## 1) Current snapshot (minimum that matters)

- Branch target: feature branches start from `develop`; avoid direct commits on `develop`
- Source of truth for factual state: `PROJECT_STATE.md`
- Backend tests last verified PASS for the HU_01 `rules_v1` targeted slice on 2026-03-17 (`tests/electricityReceiptClassifier.test.js`, 10/10)
- HU17, HU18, and HU19 are closed on `develop` for the documented local/browser scope
- HU_01 is already integrated on `develop` as a backend-only Fase 2 slice: `src/services/receiptDetection/electricityReceiptClassifier.js`
- HU_02 now has a dedicated route + service: `POST /api/v1/receipt-detection/extract` backed by `src/services/receiptDetection/receiptDetectionService.js`, `tests/fixtures/receiptDetection/`, and the Node-first extractor (`electricityInvoiceExtractor.js`). The contract returns `{ amount, due_date }` with `null` fallback for ambiguous, negative, and empty inputs; structurally invalid payloads return 400.
- Next action: finish documenting the HU_03 backend slice and open the PR; keep UI/workflow integration and broader notification wiring in a separate follow-up branch after merge.
- If the checkpoint feels stale, verify directly in `src/index.js`, `src/routes/*`, `src/services/*`, and `tests/*`

---

## 2) Where to change what

- Add/adjust endpoints: `src/routes/*` + `src/controllers/*`
- Business rules: `src/services/*` + `src/commands/*`
- Events / naming / listeners: `src/events/*` + `src/plugins/eventBus.js`
- Persistence: `src/models/*` + migrations/seeders (if needed)
- Tests: `tests/*.test.js`

---

## 3) Quick commands

### Tests
- `npm test`
- `npm run test:watch`
- `npm test -- notificationEventsRoutes.integration.test.js`
- `npm test -- getNotificationSummaryForUser.test.js`
- `npm test -- inboxActions.test.js inboxActionsRoutes.test.js`
- `npm test -- fixtureInboxSource.test.js emailsFixtureRoutes.integration.test.js`
- `npm test -- electricityReceiptClassifier.test.js`

### Dev server
- `npm run dev`
- `npm run dev:pretty`

### DB (Sequelize CLI)
- `npm run db:migrate`

### Local E2E helpers
- `INBOX_SOURCE=fixture npm run dev`
- `npm run session:e2e`

---

## 4) Workflow checkpoint

- Resume from `PROJECT_STATE.md`, not from this file
- If the next slice changes contracts, migrations, auth/session, events, CI/CD, or setup behavior, load the owner docs and run the ADR/DDR gates before coding
- If a coherent slice is already complete, switch into commit-readiness before expanding scope

## 5) Documentation rules (do not forget)

- `PROJECT_STATE.md`: only verified facts (code/tests). One next immediate action.
- `README_REENTRY.md`: short, operational, no duplicates. Must enable fast re-entry.
