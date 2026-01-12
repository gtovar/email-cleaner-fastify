# README_REENTRY.md — Email Cleaner & Smart Notifications (Fastify Backend)

> Goal: restore context in 1–2 minutes without reading long docs.

## 0) Re-entry checklist (strict order)

1) Check branch + status (`type/huNN-short-desc`, base branch `develop`):
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
- Backend tests: PASS (Jest, 12 suites / 41 tests)
- Auth flow: Google OAuth sets httpOnly `session_token` cookie and validates JWT via `authMiddleware`
- Primary endpoints:
  - Gmail OAuth: `/auth/google`, `/auth/google/callback`
  - v1: `/api/v1/emails`, `/api/v1/suggestions`
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

### Dev server
- `npm run dev`
- `npm run dev:pretty`

### DB (Sequelize CLI)
- `npm run db:migrate`

---

## 4) Documentation rules (do not forget)

- `PROJECT_STATE.md`: only verified facts (code/tests). One next immediate action.
- `README_REENTRY.md`: short, operational, no duplicates. Must enable fast re-entry.
