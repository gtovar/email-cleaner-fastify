# PROJECT_STATE.md

## 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
REPO_PATH: /Users/gil/Documents/email-cleaner/email-cleaner-fastify
BRANCH: docs/sync-truth-2026-01-08
COMMIT: b9fff3c

SNAPSHOT_DATE: 2026-01-08 02:01 CST (America/Monterrey)
WORKING_TREE_STATUS: Clean (git status: clean)

RUNTIME: Node.js (Fastify)
DB: PostgreSQL via Sequelize
TEST_STATUS: PASS (Jest)

LAST_VERIFIED_TESTS_DATE: 2026-01-08

---

## 2. Executive Summary

- All backend Jest tests are passing (12 test suites / 40 tests) on the snapshot branch.
- HTTP API is exposed via Fastify with Swagger UI at `/docs`.
- Core endpoints implemented:
  - `/auth/google` + `/auth/google/callback`
  - `/api/v1/emails`
  - `/api/v1/suggestions`
  - `/api/v1/notifications/summary`, `/confirm`, `/history`, `/events`
- Domain event bus exists with canonical event names:
  - `domain.suggestions.generated`
  - `domain.suggestions.confirmed`
- Confirmation flow persists per-email actions in `ActionHistory` and emits `domain.suggestions.confirmed`.

---

## 3. Component-by-Component Technical State

### 3.1 Fastify Backend

- Entrypoint: `src/index.js` registers plugins (Sequelize, EventBus, Swagger) and routes.
- Routes are registered with explicit prefixes:
  - `emailRoutes` → prefix `/api/v1`
  - `notificationsRoutes` → prefix `/api/v1/notifications`
  - `suggestionRoutes` currently defines `/api/v1/suggestions` directly (no prefix).
- CORS is configured for `http://localhost:5173`.

### 3.2 CQRS-lite / Commands / Domain Events

- Write-path commands exist for:
  - Confirming suggested actions: `src/commands/notifications/confirmActionCommand.js`
  - Recording notification events: `src/commands/notification_events/recordNotificationEventCommand.js`
- In-memory EventBus exists (`src/events/eventBus.js`) and is injected via a Fastify plugin (`src/plugins/eventBus.js`).
- Subscribers persist domain events to `NotificationEvent` (`registerNotificationEventListeners` → `saveToNotificationEvent`).

### 3.3 Persistence (Sequelize Models)

- `ActionHistory`: stores per-email actions (userId, emailId, action, timestamp, details).
- `NotificationEvent`: stores a denormalized event record (type, userId, summary JSONB).

### 3.4 External Integrations

- Gmail OAuth routes exist (`/auth/google`, `/auth/google/callback`).
- n8n webhook listener exists but is currently a safe no-op (logs only).

---

## 4. Current Technical Risks

- Logging: confirm/action command and event listeners log payloads; ensure no sensitive data is logged in production.

---

## 5. Next Immediate Action

- Update documentation to match the current code truth:
  - PROJECT_STATE.md and README_REENTRY.md must match the protocol templates and reflect this snapshot without “NOT VERIFIED” notes.

---

## 6. Version Log

- 2026-01-08: Docs sync checkpoint on branch `docs/sync-truth-2026-01-08` (tests PASS; docs need protocol alignment).
