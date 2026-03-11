# PROJECT_STATE.md
Last updated: 2026-03-11 00:39 CST — Commit: pending

## 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
SNAPSHOT_DATE: 2026-03-11 00:39 CST
COMMIT: pending
ENVIRONMENT: local

REPO_PATH: /Users/gil/Documents/email-cleaner/email-cleaner-fastify
BRANCH: develop
WORKING_TREE_STATUS: Dirty (modified files present)

RUNTIME: Node.js (Fastify)
DB: PostgreSQL via Sequelize
TEST_STATUS: PASS (Jest)

LAST_VERIFIED_TESTS_DATE: 2026-03-11 00:39 CST

---

## 2. Executive Summary

- Fastify API exposes OAuth routes and v1 endpoints for emails, inbox actions, suggestions, and notifications.
- OAuth flow validates `state`, issues `session_token`, and redirects to `${FRONTEND_ORIGIN}/auth/callback`.
- Auth middleware accepts session cookie or Bearer session JWT and sets `request.user`.
- `/api/v1/emails` now resolves its Inbox source via `INBOX_SOURCE` and can use Gmail or a deterministic local fixture without changing the HTTP contract.
- `/api/v1/suggestions` enriches emails with ML suggestions, includes `snippet`, and publishes domain events when threshold is met.
- `/api/v1/notifications/summary` aggregates `NotificationEvent` records by period.
- Gmail OAuth client persists refreshed access tokens to the `Tokens` table.
- OAuth tokens are encrypted at rest using `TOKEN_ENCRYPTION_KEY`.

---

## 3. Component-by-Component Technical State

### 3.1 Fastify Backend

- Entrypoint: `src/index.js` registers CORS, cookie, Sequelize, EventBus, and routes.
- Routes are registered with prefixes:
  - `emailRoutes` → `/api/v1`
  - `inboxRoutes` → `/api/v1/inbox`
  - `suggestionRoutes` → `/api/v1`
  - `notificationsRoutes` → `/api/v1/notifications`
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

### 3.4 External Integrations

- Gmail OAuth routes: `/auth/google`, `/auth/google/callback`.
- Gmail OAuth clients are created via `src/services/googleAuthService.js`.
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
- The full local browser suite now passes for row-level and bulk Inbox actions against the fixture Inbox environment, closing HU19 at the backend contract/integration level for local scope (commit: pending).

---

## 5. Current Technical Risks

- OAuth cookies require correct SameSite/Secure settings in production.
- `src/events/listeners/sendWebhookToN8NEvent.js` is still a safe no-op, so the n8n delivery path is not yet validated end-to-end.

---

## 6. Next Immediate Action

➡️ Choose the next backend-facing product slice after HU19 closure and update the checkpoint to reflect that new focus.

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
