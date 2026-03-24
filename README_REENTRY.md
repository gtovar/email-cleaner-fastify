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
- Backend tests last verified PASS for the local `HU_07A` contract slice on 2026-03-23 (`tests/receiptResponseRoutes.test.js`)
- HU17, HU18, and HU19 are closed on `develop` for the documented local/browser scope
- HU_01 is already integrated on `develop` as a backend-only Fase 2 slice: `src/services/receiptDetection/electricityReceiptClassifier.js`
- HU_02 now has a dedicated route + service: `POST /api/v1/receipt-detection/extract` backed by `src/services/receiptDetection/receiptDetectionService.js`, `tests/fixtures/receiptDetection/`, and the Node-first extractor (`electricityInvoiceExtractor.js`). The contract returns `{ amount, due_date }` with `null` fallback for ambiguous, negative, and empty inputs; structurally invalid payloads return 400.
- The backend now exposes `GET /api/v1/emails/:id/content` for authenticated normalized full-content retrieval by `emailId`, with Gmail and fixture source support and ADR 009 documenting the boundary.
- `GET /api/v1/emails/:id/content` is already consumed by the merged `HU_05` React slice on `develop`.
- The fixture inbox now contains the original HU19 action rows plus dedicated HU06 receipt-review rows with extractor-ready bodies for local browser validation.
- The HU06 provider-error browser case is still a frontend-controlled override on `POST /api/v1/notifications/receipt-whatsapp`; backend fixture support only covers the deterministic happy-path content route.
- The repo is currently clean on `feat/hu07a-receipt-response-backend` after the local `HU_07A` backend boundary checkpoint.
- Commit hooks are now versioned in `.husky/`: `pre-commit` preserves the README timestamp update through repo-local scripts under `scripts/git-hooks/`, while `commit-msg` validates Conventional Commit syntax with `commitlint`.
- `.github/workflows/ci.yml` now validates PR commit messages with `commitlint` remotely before the main lint/test job runs.
- The Husky `prepare` step now uses a guarded repo-local installer so `npm ci --omit=dev` skips hook installation cleanly instead of failing in production-style builds.
- The repo-local Husky `pre-commit` flow now includes `scripts/git-hooks/check-comment-hygiene.sh`, blocking empty comments plus vague follow-up markers before commit.
- `HU_07A` now exists on `feat/hu07a-receipt-response-backend` as a separate `/api/v1/receipt-responses` boundary backed by `src/models/receiptResponse.js` and `migrations/20260323182000-create-receipt-responses.cjs`; `targetId` stays external while the backend resolves it to `emailId` for this slice.
- Next action: push the feature branch and open the PR to `develop` for the `HU_07A` backend slice.
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
- `npm test -- receiptResponseRoutes.test.js`
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
