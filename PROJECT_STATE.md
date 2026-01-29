# PROJECT_STATE.md
Last updated: 2026-01-29 00:00 CST — Commit: pending

## 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
SNAPSHOT_DATE: 2026-01-29 00:00 CST
COMMIT: pending
ENVIRONMENT: local

REPO_PATH: /Users/gil/Documents/email-cleaner/email-cleaner-fastify
BRANCH: develop
WORKING_TREE_STATUS: Dirty (modified files present)

RUNTIME: Node.js (Fastify)
DB: PostgreSQL via Sequelize
TEST_STATUS: PASS (Jest)

LAST_VERIFIED_TESTS_DATE: 2026-01-18 02:35 CST

---

## 2. Executive Summary

- Fastify API exposes OAuth routes and v1 endpoints for emails, suggestions, and notifications.
- OAuth flow validates `state`, issues `session_token`, and redirects to `${FRONTEND_ORIGIN}/auth/callback`.
- Auth middleware accepts session cookie or Bearer session JWT and sets `request.user`.
- `/api/v1/emails` returns raw Gmail emails without ML.
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

**Status:** IN_PROGRESS

**Evidence:**
- Routes: `/api/v1/suggestions`, `/api/v1/notifications/summary`
- Services: `src/services/suggestionService.js`, `src/services/notificationsService.js`
- Event publish threshold in `src/controllers/suggestionController.js`

**Open items:**
- Re-validate `/api/v1/notifications/events` behavior.

**Technical risks:**
- Summary windowing uses `createdAt`; time zone alignment is not verified.

**Recent change:**
- ML schema defaulted `category` and suggestions schema includes `snippet` (commit: pending).

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

---

## 5. Current Technical Risks

- OAuth cookies require correct SameSite/Secure settings in production.
- Summary windowing uses `createdAt`; time zones must be validated.

---

## 6. Next Immediate Action

➡️ Commit Fastify fixes on a feature branch from `develop`.

---

## Version log

- 2026-01-18 02:35 CST — OAuth state, token encryption, and logging hardening (commit: pending)
- 2026-01-29 00:00 CST — ML schema default category + suggestions schema includes snippet (commit: pending)
