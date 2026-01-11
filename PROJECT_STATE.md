# PROJECT_STATE.md

Last updated: 2026-01-11 15:21 CST — Commit: pending

## 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
REPO_PATH: /Users/gil/Documents/email-cleaner/email-cleaner-fastify
BRANCH: feat/hu17-unify-suggestions-summary
COMMIT: pending

SNAPSHOT_DATE: 2026-01-11 15:21 CST (America/Monterrey)
WORKING_TREE_STATUS: Clean (git status: clean)

RUNTIME: Node.js (Fastify)
DB: PostgreSQL via Sequelize
TEST_STATUS: PASS (Jest)

LAST_VERIFIED_TESTS_DATE: 2026-01-11

---

## 2. Executive Summary

- All backend Jest tests are passing (12 test suites / 40 tests) on the snapshot branch.
- HTTP API is exposed via Fastify with Swagger UI at `/docs`.
- Core endpoints implemented:
  - `/auth/google` + `/auth/google/callback`
  - `/api/v1/emails`
  - `/api/v1/suggestions`
  - `/api/v1/notifications/summary`, `/confirm`, `/history`, `/events`
- Notifications summary returns an aggregate object based on `NotificationEvent` records (windowed by `period`).
- Suggestions use `classification` as the ML label field (English-only contract).
- `domain.suggestions.generated` is published only when total suggestions are >= 10.

---

## 3. Component-by-Component Technical State

### 3.1 Fastify Backend

- Entrypoint: `src/index.js` registers plugins (Sequelize, EventBus, Swagger) and routes.
- Routes are registered with explicit prefixes:
  - `emailRoutes` → prefix `/api/v1`
  - `suggestionRoutes` → prefix `/api/v1`
  - `notificationsRoutes` → prefix `/api/v1/notifications`
- CORS is configured for `http://localhost:5173`.

### 3.2 CQRS-lite / Commands / Domain Events

- Write-path commands exist for:
  - Confirming suggested actions: `src/commands/notifications/confirmActionCommand.js`
  - Recording notification events: `src/commands/notification_events/recordNotificationEventCommand.js`
- In-memory EventBus exists (`src/events/eventBus.js`) and is injected via a Fastify plugin (`src/plugins/eventBus.js`).
- Subscribers persist domain events to `NotificationEvent` (`registerNotificationEventListeners` → `saveToNotificationEvent`).

### 3.3 Persistence (Sequelize Models)

- `ActionHistory`: stores per-email actions (userId, emailId, action, timestamp, details).
- `NotificationEvent`: stores a denormalized event record (type, userId, summary JSONB) used for aggregated summary views.

### 3.4 External Integrations

- Gmail OAuth routes exist (`/auth/google`, `/auth/google/callback`).
- n8n webhook listener exists but is currently a safe no-op (logs only).

---

## 4. User Story Status (Evidence-Driven)

### HU17 — Suggestions vs Summary alignment (backend)

**Status:** IN_PROGRESS

**Evidence:**
- Routes: `/api/v1/suggestions`, `/api/v1/notifications/summary`
- Services: `src/services/suggestionService.js`, `src/services/notificationsService.js`
- Tests: `tests/notifications.test.js`

**Open items:**
- Verify `domain.suggestions.generated` threshold behavior in production-like environment.

**Technical risks:**
- Summary windowing uses `createdAt` timestamps; time zone alignment should be verified for production reporting.

**Recent change:**
- Summary aggregation and suggestions contract aligned to `classification` (commit: e2b229e).

---

## 5. Current Technical Risks

- Logging: confirm/action command and event listeners log payloads; ensure no sensitive data is logged in production.
- Summary windowing uses `createdAt` timestamps; time zone alignment should be verified for production reporting.

---

## 6. Next Immediate Action

➡️ Verify EventBus threshold behavior in production-like environment.

---

## 7. Version Log

- 2026-01-10: Notifications summary uses aggregated `NotificationEvent` data and suggestions use `classification` (commit: 31238d4).
- 2026-01-11: Suggestions event publish threshold set to >= 10 (commit: e2b229e).
- 2026-01-11: Project state metadata updated (commit: pending).
