# PROJECT_STATE.md
Last updated: 2026-03-23 18:47 CST — Commit: 1eb8224

## 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
SNAPSHOT_DATE: 2026-03-23 18:47 CST
COMMIT: 1eb8224
ENVIRONMENT: feat/hu07a-receipt-response-backend

REPO_PATH: /Users/gil/Documents/email-cleaner/email-cleaner-fastify
BRANCH: feat/hu07a-receipt-response-backend
WORKING_TREE_STATUS: Clean

RUNTIME: Node.js (Fastify)
DB: PostgreSQL via Sequelize
TEST_STATUS: PASS (`npm test -- receiptResponseRoutes.test.js`)

LAST_VERIFIED_TESTS_DATE: 2026-03-23 18:47 CST

Notes:
- This snapshot reflects the local `HU_07A` checkpoint after the backend boundary commit landed on a feature branch.

---

## 2. Executive Summary

- Fastify API exposes OAuth routes and v1 endpoints for emails, inbox actions, suggestions, and notifications.
- OAuth flow validates `state`, issues `session_token`, and redirects to `${FRONTEND_ORIGIN}/auth/callback`.
- Auth middleware accepts session cookie or Bearer session JWT and sets `request.user`.
- `/api/v1/emails` now resolves its Inbox source via `INBOX_SOURCE` and can use Gmail or a deterministic local fixture without changing the HTTP contract.
- `/api/v1/emails/:id/content` now exposes authenticated normalized full email content by `emailId`, keeping `GET /api/v1/emails` unchanged.
- The fixture inbox now contains the original HU19 action rows plus dedicated HU06 receipt-review rows with extractor-ready bodies, so the local browser flow can validate receipt review without changing the HTTP contract.
- `/api/v1/suggestions` enriches emails with ML suggestions, includes `snippet`, and publishes domain events when threshold is met.
- `/api/v1/notifications/summary` aggregates `NotificationEvent` records by period.
- `HU_07A` now adds a separate authenticated receipt-response boundary at `/api/v1/receipt-responses`, keeping `POST /api/v1/notifications/confirm` dedicated to suggestion confirmation.
- Gmail OAuth client persists refreshed access tokens to the `Tokens` table.
- ADR 009 records the additive email-content route decision and the extension of the inbox source boundary for single-message content retrieval.
- ADR 010 records the decision to keep manual receipt-response state separate from suggestion confirmation and to resolve `targetId` to `emailId` inside `HU_07A`.
- OAuth tokens are encrypted at rest using `TOKEN_ENCRYPTION_KEY`.
- Commit hooks are now versioned in `.husky/`, with `commit-msg` validating Conventional Commit syntax via `commitlint` and `pre-commit` preserving both the README timestamp update and the repo-local governance checks under `scripts/git-hooks/`.
- GitHub Actions `ci.yml` now validates PR commit messages with `commitlint` before the main lint/test job runs.
- The Husky `prepare` step now uses a guarded repo-local installer, so production-style installs that omit devDependencies skip hook installation cleanly instead of failing.
- The repo-local Husky `pre-commit` flow now includes `scripts/git-hooks/check-comment-hygiene.sh`, blocking empty comments plus vague follow-up markers before commit.
- The Husky/comment-hygiene checkpoint work is already merged into `develop`; there is no pending hook-migration branch to resume.
- A local rule-based electricity-receipt classifier now exists as an internal backend service using only `subject`, `sender`, and `body`, with deterministic `invoice_electricity | not_invoice | unknown` output.
- A Node-first extractor service now powers `HU_02` with the six spike fixtures plus an empty/malformed case run through `tests/electricityInvoiceExtractor.test.js`, keeping `amount`/`due_date` and the `null` fallback explicit before wiring the production slice.
- HU_03 now exposes `POST /api/v1/notifications/receipt-whatsapp` via `notificationDeliveryRoutes`, `notificationDeliveryController`, `receiptNotificationService`, and the deterministic `twilioAdapter`; the route only sends WhatsApp reminders when `{ amount, due_date }` are present and logs every delivery through `notificationDeliveryLogService`.
- A Node-first invoice-extraction service now lives in `src/services/receiptDetection/electricityInvoiceExtractor.js` with fixtures-driven regression coverage to keep the `amount | due_date` contract and `null` fallback explicit before wiring the production slice.

---

## 3. Component-by-Component Technical State

### 3.1 Fastify Backend

- Entrypoint: `src/index.js` registers CORS, cookie, Sequelize, EventBus, and routes.
- Routes are registered with prefixes:
  - `emailRoutes` → `/api/v1`
  - `inboxRoutes` → `/api/v1/inbox`
  - `suggestionRoutes` → `/api/v1`
  - `notificationsRoutes` → `/api/v1/notifications`
  - `receiptResponseRoutes` → `/api/v1`
- CORS is configured for `FRONTEND_ORIGIN` with `credentials: true`.
- Swagger exposes cookie auth and bearer auth schemes.

### 3.2 CQRS-lite / Commands / Domain Events

- Commands:
  - `src/commands/notifications/confirmActionCommand.js`
  - `src/commands/notification_events/recordNotificationEventCommand.js`
- EventBus:
  - In-memory bus via `src/events/eventBus.js`.
  - Registered through `src/plugins/eventBus.js`.
- Subscribers persist events to `NotificationEvent`.

### 3.3 Persistence (Sequelize Models)

- `ActionHistory`: per-email actions (userId, emailId, action, timestamp, details).
- `NotificationEvent`: denormalized event record (type, userId, summary JSONB).
- `ReceiptResponse`: per-user current receipt-response state keyed by `(userId, emailId)` with `response` constrained to `paid | ignore`.

### 3.4 External Integrations

- Gmail OAuth routes: `/auth/google`, `/auth/google/callback`.
- Gmail OAuth clients are created via `src/services/googleAuthService.js`.
- Email content retrieval now supports both Gmail and fixture inbox sources through `src/services/inboxSources/gmailInboxSource.js`, `src/services/inboxSources/fixtureInboxSource.js`, and `src/services/gmailService.js`.
- ML service integration via `src/services/suggestionService.js` and `src/services/mlClient.js`.
- n8n webhook listener exists (safe no-op).
- Gmail metadata defaults `category` to `unknown` when no label match is found.
- ML schema accepts missing `category` with default `unknown`.

---

## 4. User Story Status (Evidence-Driven)

### HU17 — Suggestions vs Summary alignment (backend)

**Status:** DONE

**Evidence:**
- Routes: `/api/v1/suggestions`, `/api/v1/notifications/summary`
- Services: `src/services/suggestionService.js`, `src/services/notificationsService.js`
- Event publish threshold in `src/controllers/suggestionController.js`
- Revalidation evidence for `/api/v1/notifications/events`: `tests/notificationEventsRoutes.integration.test.js`
- Temporal contract evidence for `/api/v1/notifications/summary`: `tests/getNotificationSummaryForUser.test.js`

**Open items:**
- None.

**Technical risks:**
- Summary semantics are now explicit: `daily` and `weekly` are rolling UTC windows over persisted `NotificationEvent.createdAt`, inclusive on both boundaries.

**Recent change:**
- HU17 closed after revalidating `/api/v1/notifications/events`, defining the temporal contract for `/api/v1/notifications/summary`, and adding targeted tests for rolling UTC windows over persisted `createdAt` (commit: pending).

### HU18 — Google OAuth session flow (backend)

**Status:** DONE

**Evidence:**
- Routes: `/auth/google`, `/auth/google/callback`
- Middleware: `src/middlewares/authMiddleware.js`
- Controllers: `src/controllers/authController.js`
- Tests: `tests/authRoutes.test.js`

**Open items:**
- None.

**Technical risks:**
- Misconfigured `FRONTEND_ORIGIN` can break OAuth redirects and cookies.

**Recent change:**
- OAuth state validation and token encryption added (commit: pending).

### HU19 — Inbox direct and bulk actions (backend)

**Status:** DONE

**Evidence:**
- Route: `/api/v1/inbox/actions`
- Files: `src/routes/inboxRoutes.js`, `src/controllers/inboxActionsController.js`, `src/services/inboxActionsService.js`
- Persistence: `src/models/actionHistory.js`, `migrations/20260310013500-add-mark-unread-to-action-history.cjs`
- Tests: `tests/inboxActions.test.js`, `tests/inboxActionsRoutes.test.js`

**Open items:**
- Apply the new ActionHistory enum migration in environments with an existing database.

**Technical risks:**
- Gmail side effects are still stubbed in `src/services/actionExecutor.js` for Inbox direct actions.
- Existing databases need the enum migration before `mark_unread` can be persisted safely outside test mocks.
- `INBOX_SOURCE=fixture` is intended only for local/E2E reproducibility and must not replace Gmail-backed Inbox reads in production.

**Recent change:**
- Implemented the dedicated Inbox-action contract from ADR 007 via `POST /api/v1/inbox/actions`, added targeted route/service tests, and widened `ActionHistory` to include `mark_unread` (commit: pending).
- Introduced an Inbox source seam for `/api/v1/emails` so local/E2E runs can switch from Gmail to a deterministic fixture dataset for `e2e-user@example.com`, and added a helper to mint `session_token` values without live Google OAuth (commit: pending).
- The React row-level Inbox UX now passes local Playwright validation against the fixture Inbox path and `POST /api/v1/inbox/actions`; bulk actions remain the only HU19 feature gap in app behavior (commit: pending).
- Accepted ADR 008 to freeze bulk-result semantics, per-item response detail, and local reconciliation rules before implementation begins (commit: pending).
- Updated `/api/v1/inbox/actions` to return ADR 008 semantics (`execution`, `summary`, `results`) and added targeted backend tests for full, partial, none, and systemic outcomes (commit: pending).
- The full local browser suite now passes for row-level and bulk Inbox actions against the fixture Inbox environment, closing HU19 at the backend contract/integration level for the documented local/browser scope (commit: pending).
- Preserved per-item outcomes when `ActionHistory.bulkCreate` fails after item execution, so post-action persistence errors no longer collapse successful destructive operations into blanket `system_error` results; targeted Jest validation passed for `tests/inboxActions.test.js` and `tests/inboxActionsRoutes.test.js` (commit: pending).
- HU19 backend changes, ADR 007/008, CI workflow updates, and the backend governance docs are now merged into `develop` (commit: pending).

### HU_01 (Fase 2) — Initial local electricity bill detection (backend-only rules_v1)

**Status:** DONE

**Evidence:**
- Service: `src/services/receiptDetection/electricityReceiptClassifier.js`
- Tests: `tests/electricityReceiptClassifier.test.js`
- Contract: `{ subject, sender, body } -> { type, confidence, method, reason }`

**Open items:**
- None.

**Technical risks:**
- The first ruleset is intentionally conservative and may need broader sender/content signals beyond initial `CFE`-leaning patterns.
- Generic payment language can still create false positives if future rule expansion drops the current `unknown` fallback discipline.
- Mixed sender/content evidence with stronger negative semantics now falls back to `unknown`, but future rule expansion still needs explicit precedence rules to avoid reintroducing over-classification.

**Recent change:**
- Added a backend-only `rules_v1` classifier for local electricity-receipt detection with an 8-case simulated dataset plus invalid-input coverage, then fixed the mixed-signal false-positive path so emails containing strong negative cues plus electricity cues now fall back to `unknown`; targeted Jest validation passes with 10/10 tests, and the full HU_01 slice is merged into `develop` via PR #32 (commit: pending).

### HU_02 (Fase 2) — Local Node-first amount & due_date extraction

**Status:** DONE (production slice merged into `develop`, route registered)

**Evidence:**
- Service: `src/services/receiptDetection/electricityInvoiceExtractor.js`
- Route/service: `src/routes/receiptDetectionRoutes.js`, `src/controllers/receiptDetectionController.js`, `src/services/receiptDetection/receiptDetectionService.js`
- Integration test: `tests/receiptDetectionRoutes.test.js` (positive/ambiguous/negative/empty + 400 validation)
- Spike artifacts: `spikes/hu02-extraction/` README, fixtures, runner, and result

**Open items:**
- None tracked; the route is live and registered.

**Technical risks:**
- Heuristic parsing may need refinement as additional invoice variants arrive; keep the contract scoped and fall back to `null` when confidence is insufficient.

**Recent change:**
- Added the Node-first extractor service, fixture dataset, and regression test suite so the production slice can start from `feature/hu02-node-extraction` (commit: pending)

### HU_03 — WhatsApp notification delivery

**Status:** DONE (route registered; documenting/PR work underway)

**Evidence:**
- Route: `src/routes/notificationDeliveryRoutes.js`
- Controller/service: `src/controllers/notificationDeliveryController.js`, `src/services/notifications/receiptNotificationService.js`
- Twilio adapter/log: `src/services/notifications/twilioAdapter.js`, `src/services/notifications/notificationDeliveryLogService.js`
- Tests: `tests/notificationDeliveryRoutes.test.js`, `tests/receiptNotificationService.test.js`, `tests/twilioAdapter.test.js`
- Fixtures: `tests/fixtures/notifications/` (positive/ambiguous/negative/provider-failure cases)

**Open items:**
- UI/workflow integration and broader notification wiring remain for a follow-up branch once the backend PR lands.

**Technical risks:**
- Deliveries depend on valid `{ amount, due_date }`; the controller/service skip and log this case, keeping fallback behavior deterministic.

**Recent change:**
- Documented the WhatsApp delivery contract in `docs/API_REFERENCE.md`, covering the route, service, adapter, log, and regression tests (success, skip, provider failure).
- Added the WhatsApp delivery route, service, Twilio adapter, and fixture-driven regression tests; the route now lives at `POST /api/v1/notifications/receipt-whatsapp` and reuses `receiptNotificationService`.
- Added `authMiddleware` protection to the WhatsApp route to enforce the documented `session_token`/Bearer requirement before delivering messages.

### HU_05 prerequisite — Authenticated email content retrieval by `emailId`

**Status:** DONE

**Evidence:**
- ADR: `docs/adr/009-email-content-route-for-receipt-extraction.md`
- Route: `src/routes/emailRoutes.js`
- Controller: `src/controllers/emailController.js`
- Sources/services: `src/services/gmailService.js`, `src/services/inboxSources/gmailInboxSource.js`, `src/services/inboxSources/fixtureInboxSource.js`
- Tests: `tests/emailsRoutes.test.js`, `tests/emailsFixtureRoutes.integration.test.js`, `tests/gmailService.test.js`

**Open items:**
- None for this backend prerequisite slice.

**Technical risks:**
- MIME/body normalization remains intentionally minimal and may need future refinement if Gmail payload variants expand.

**Recent change:**
- Added authenticated `GET /api/v1/emails/:id/content` so the frontend can retrieve normalized `{ id, subject, from, body, html }` data without changing `GET /api/v1/emails`, receipt extraction, or WhatsApp delivery (commit: pending).
- Added dedicated HU06 fixture emails with extractor-ready receipt bodies so the local browser validation path no longer depends on HU19 fixture rows, and expanded `tests/emailsFixtureRoutes.integration.test.js` to assert the second HU06 content route explicitly (commit: pending).

### HU_07A — Backend manual receipt response state

**Status:** DONE

**Evidence:**
- Route: `src/routes/receiptResponseRoutes.js`
- Controller/service: `src/controllers/receiptResponseController.js`, `src/services/receiptResponseService.js`
- Persistence: `src/models/receiptResponse.js`, `migrations/20260323182000-create-receipt-responses.cjs`
- Wiring: `src/index.js`, `src/plugins/sequelize.js`
- Tests: `tests/receiptResponseRoutes.test.js`
- ADR/API docs: `docs/adr/010-receipt-response-boundary.md`, `docs/API_REFERENCE.md`

**Open items:**
- None for the local backend slice checkpoint.

**Technical risks:**
- `targetId` is intentionally resolved to `emailId` only for `HU_07A`; future phases may still require a stronger receipt identity.
- The new migration must be applied in real database environments before the route can persist state outside mocked tests.

**Recent change:**
- Added `POST /api/v1/receipt-responses` and `GET /api/v1/receipt-responses/:targetId` as a separate authenticated boundary for manual `paid | ignore` state, keeping `POST /api/v1/notifications/confirm` unchanged for suggestion confirmation (commit: `1eb8224`).
- Added the `ReceiptResponse` model plus route-contract coverage in `tests/receiptResponseRoutes.test.js`, with `targetId` resolved to `emailId` internally for this slice (commit: `1eb8224`).

---

## 5. Current Technical Risks

- OAuth cookies require correct SameSite/Secure settings in production.
- `src/events/listeners/sendWebhookToN8NEvent.js` is still a safe no-op, so the n8n delivery path is not yet validated end-to-end.
- HU06 backend support only proves deterministic email-content retrieval for the local happy path; the visible provider-error path is still validated in the browser via a controlled frontend override.
- The new `ReceiptResponse` migration must still be applied in DB-backed environments before manual route verification outside mocked tests.

---

## 6. Next Immediate Action

➡️ Push `feat/hu07a-receipt-response-backend` and open a PR to `develop` for the `HU_07A` backend boundary.

---

## Version log

- 2026-01-18 02:35 CST — OAuth state, token encryption, and logging hardening (commit: pending)
- 2026-01-29 00:00 CST — ML schema default category + suggestions schema includes snippet (commit: pending)
- 2026-03-10 00:03 CST — Refreshed backend checkpoint after HU17/HU18 closure; full suite revalidated at 15 suites / 55 tests (commit: pending)
- 2026-03-10 00:03 CST — Registered HU19 to track Inbox direct and bulk actions after confirming backend contract drift between route enum, service behavior, and API docs (commit: pending)
- 2026-03-10 00:03 CST — Proposed ADR 007 to give HU19 a dedicated Inbox-action contract instead of reusing suggestion confirmation (commit: pending)
- 2026-03-10 01:35 CST — Implemented `POST /api/v1/inbox/actions`, added targeted contract/service tests, accepted ADR 007, and introduced the ActionHistory enum migration for `mark_unread` (commit: pending)
- 2026-03-10 02:29 CST — Added an Inbox source seam for `/api/v1/emails`, a deterministic HU19 fixture source, and a local session-token helper so HU19 E2E can run without Gmail or live Google OAuth (commit: pending)
- 2026-03-10 20:57 CST — Local Playwright validation passed for HU19 row-level Inbox actions against the fixture Inbox source and the dedicated backend contract (commit: pending)
- 2026-03-10 21:05 CST — Accepted ADR 008 to freeze bulk Inbox-action result semantics before implementation (commit: pending)
- 2026-03-10 21:20 CST — Updated `/api/v1/inbox/actions` to return ADR 008 bulk semantics and added targeted backend contract tests for the new execution states (commit: pending)
- 2026-03-11 00:39 CST — HU19 closed for local contract/browser scope after the full Playwright suite passed against the fixture Inbox environment (commit: pending)
- 2026-03-13 23:42 CST — Fixed the PR #27 P1 outcome-loss bug so `bulkCreate` persistence errors no longer overwrite already-computed per-item Inbox results; targeted Jest validation passed for `tests/inboxActions.test.js` and `tests/inboxActionsRoutes.test.js` (commit: pending)
- 2026-03-14 02:05 CST — Merged the HU19 backend branch into `develop`, including the P1 outcome-preservation fix, Node 24-compatible GitHub Actions refs, and the backend governance-doc alignment (commit: pending)
- 2026-03-16 23:27 CST — Added the backend-only HU_01 `rules_v1` electricity-receipt classifier plus its targeted 8-case Jest dataset, and verified `tests/electricityReceiptClassifier.test.js` passes locally with 9/9 tests (commit: pending)
- 2026-03-17 00:07 CST — Fixed the HU_01 mixed-signal false-positive path so strong negative cues plus electricity cues now fall back to `unknown`; `tests/electricityReceiptClassifier.test.js` passes locally with 10/10 tests (commit: pending)
- 2026-03-17 00:25 CST — HU_01 is now treated as integrated state on `develop` after PR #32 merged the backend-only detector and its follow-up false-positive fix; the next backend step is defining HU_02 as a scoped extraction spike before implementation (commit: pending)
- 2026-03-17 03:30 CST — Node-first HU_02 extraction service + fixture suite landed, triggering `feature/hu02-node-extraction` for the production slice while the spike artifacts remain in `spikes/hu02-extraction/` (commit: pending)
- 2026-03-17 04:15 CST — HU_03 WhatsApp delivery route, controller, receiptNotificationService, Twilio adapter, and regression tests landed; route now exposes `POST /api/v1/notifications/receipt-whatsapp` and logs deliveries via `notificationDeliveryLogService` (commit: pending)
- 2026-03-17 03:45 CST — Added `empty-malformed` fixture and regression test coverage so the Node-first extractor proves positive/ambiguous/negative/empty guardrails before wiring production contracts (commit: pending)
- 2026-03-17 03:55 CST — Added POST `/api/v1/receipt-detection/extract`, the thin controller/service wiring, and integration test coverage hitting the production fixtures (commit: pending)
- 2026-03-17 19:55 CST — Documented the HU_03 WhatsApp delivery API contract in `docs/API_REFERENCE.md` and captured the regression tests for success, skipped, and provider-failure outcomes before preparing the backend PR (commit: pending)
- 2026-03-17 20:12 CST — Protected `POST /api/v1/notifications/receipt-whatsapp` with `authMiddleware` to align the guardrail with the documented `session_token` requirement (commit: pending)
- 2026-03-19 18:17 CST — Added ADR 009 plus authenticated `GET /api/v1/emails/:id/content`, extending Gmail and fixture inbox sources with normalized full-content retrieval by `emailId`; targeted Jest validation passed for `tests/emailsRoutes.test.js`, `tests/emailsFixtureRoutes.integration.test.js`, and `tests/gmailService.test.js` (commit: pending)
- 2026-03-21 22:50 CST — Realigned the backend checkpoint to the verified post-HU_05 merged baseline on `develop`; the next action is story selection, not reopening `GET /api/v1/emails/:id/content` integration work (commit: pending)
- 2026-03-22 02:06 CST — Updated the fixture inbox content so the local browser receipt-review flow can extract amount and due date on deterministic E2E emails; `npm test -- emailsFixtureRoutes.integration.test.js` passed locally (commit: pending)
- 2026-03-22 03:05 CST — Split HU06 onto dedicated fixture emails and extended `tests/emailsFixtureRoutes.integration.test.js` so the browser error-path fixture dependency is explicitly covered without reusing HU19 rows (commit: pending)
- 2026-03-22 12:19 CST — Added versioned Husky hooks plus `commitlint`; `pre-commit` now preserves the README timestamp behavior and the workspace cognitive gate, while `commit-msg` blocks invalid Conventional Commit syntax (commit: pending)
- 2026-03-22 12:19 CST — Extended `ci.yml` so pull requests now validate commit messages with `commitlint` in GitHub Actions in addition to the local Husky hook (commit: pending)
- 2026-03-23 01:30 CST — Reconciled the backend operational checkpoint with the real clean `develop` baseline after the Husky/comment-hygiene slice landed (commit: pending)
- 2026-03-23 15:51 CST — Realigned the Phase 2 backlog with the code-backed baseline, closing the stale HU_02/HU_03 mismatch and registering HU_07, HU_08, and HU_09 as the next candidate slices (commit: pending)
- 2026-03-23 17:08 CST — Promoted `HU_07A` as the concrete next backend slice, split `HU_07` into backend/frontend execution slices, and anchored the next action to contract + persistence + tests in Fastify (commit: pending)
- 2026-03-23 18:24 CST — Implemented the local `HU_07A` receipt-response boundary, added the `ReceiptResponse` model/migration, documented ADR 010, and verified `tests/receiptResponseRoutes.test.js` locally while leaving the worktree pending commit-readiness (commit: pending)
- 2026-03-23 18:47 CST — Checkpointed the `HU_07A` backend boundary on `feat/hu07a-receipt-response-backend` in commit `1eb8224`, keeping the next step focused on PR preparation rather than more backend scope (commit: `1eb8224`)
