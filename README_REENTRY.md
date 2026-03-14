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

- Branch: `develop`
- Latest checkpoint: `PROJECT_STATE.md`
- Backend tests: full suite last verified PASS (Jest, 15 suites / 55 tests) on 2026-03-10; HU19 targeted tests (`inboxActions*.test.js`) pass on 2026-03-10
- Auth flow: Google OAuth validates `state`, sets httpOnly `session_token` cookie, and validates JWT via `authMiddleware`
- For local/E2E only, `/api/v1/emails` can switch to a deterministic fixture source with `INBOX_SOURCE=fixture`
- OAuth tokens are encrypted at rest (`TOKEN_ENCRYPTION_KEY`)
- Gmail client persists refreshed tokens to the `Tokens` table
- Swagger exposes `cookieAuth` and `bearerAuth` security schemes
- `/api/v1/notifications/events` was revalidated on the real route/service path; omitting `userId` scopes the feed to the authenticated user
- `/api/v1/notifications/summary` now has an explicit temporal contract: `daily` = rolling last 24 hours UTC, `weekly` = rolling last 7 days UTC, both over persisted `NotificationEvent.createdAt`
- n8n webhook listener remains a safe no-op checkpoint in `src/events/listeners/sendWebhookToN8NEvent.js`
- HU19 backend is now in progress: `POST /api/v1/inbox/actions` exists as the dedicated contract for direct Inbox actions.
- The full HU19 browser flow has now been validated locally against the fixture Inbox source: row-level and bulk Inbox scenarios both pass in Playwright.
- ADR 008 now freezes bulk-result semantics, including partial success, per-item results, and local reconciliation for the first implementation pass.
- `/api/v1/inbox/actions` now returns ADR 008 response fields for the bulk path: `execution`, `summary`, and `results`.
- ADR 007 is accepted: suggestion confirmation stays on `/api/v1/notifications/confirm`, while Inbox direct actions use `/api/v1/inbox/actions`.
- Primary endpoints:
  - Gmail OAuth: `/auth/google`, `/auth/google/callback`
  - v1: `/api/v1/emails`, `/api/v1/inbox/actions`, `/api/v1/suggestions`
  - Notifications: `/api/v1/notifications/summary|confirm|history|events`
- Architecture: CQRS-lite + in-memory EventBus + `NotificationEvent` persistence

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

### Dev server
- `npm run dev`
- `npm run dev:pretty`

### DB (Sequelize CLI)
- `npm run db:migrate`

### Local E2E helpers
- `INBOX_SOURCE=fixture npm run dev`
- `npm run session:e2e`

---

## 4) Documentation rules (do not forget)

- `PROJECT_STATE.md`: only verified facts (code/tests). One next immediate action.
- `README_REENTRY.md`: short, operational, no duplicates. Must enable fast re-entry.
