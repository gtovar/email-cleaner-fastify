## Sprint_Log.md — Backend Fastify

(Email Cleaner & Smart Notifications — Backend)
Last updated: 2026-01-12 01:53 CST

---

### 2025-11-20 — HU5 started
- ML contract v1 defined (`/v1/suggest`).
- Branch created: `feature/hu5-ml-schema-alignment`.

### 2025-11-21 — mlClient updated
- Default path switched to `/v1/suggest`.
- Payload changed to raw email arrays.

### 2025-11-21 — suggestionService updated
- Normalized ML enriched-array output.
- Legacy mapping preserved.

### 2025-11-21 — Tests updated
- `tests/mlClient.test.js` and `tests/suggestionService.test.js` aligned to v1.

### 2025-11-22 — HU5 completed
- Full backend test suite green.
- Contract v1 validated with curl.

---

### 2025-11-28 — HU12 validated
- Fastify ↔ ML integration fallback behavior tested.
- suggestionService fallback confirmed.

### 2025-11-28 — Merge HU5 + HU12 into develop
- Backend stabilized under ML v1 contract.
- All tests passing.

---

### 2025-11-30 — Documentation synchronized
- PROJECT_STATE.md rewritten using template.
- README_REENTRY.md updated.
- Sprint_Log updated to this point.

### 2025-12-03 — HU16 Notification Event Pipeline completed
- Added NotificationEvent model and migration.
- `/api/v1/notifications/events` added with pagination and filters.
- Tests and API docs updated.

---

### 2026-01-08 — Doc sync + HU canon alignment
- Backend tests: PASS (12 suites, 40 tests).
- Canon: ActionHistory vs NotificationEvent clarified.

### 2026-01-10 — Notifications summary aggregated
- `/api/v1/notifications/summary` now aggregates from NotificationEvent.
- Period windowing (`daily|weekly`) covered by tests.

### 2026-01-10 — Suggestions contract unified
- Suggestions now use `classification` field (English-only).

### 2026-01-11 — Doc health sync
- Updated `PROJECT_STATE.md` and `README_REENTRY.md` snapshot references.

### 2026-01-11 — Coverage artifacts removed
- Removed `coverage/` from the repo and ignored it in `.gitignore`.

### 2026-01-11 — OAuth session flow updated
- Added httpOnly session cookie flow and JWT verification.

### 2026-01-12 — Gmail token refresh persistence
- Gmail client now uses refresh tokens and persists refreshed access tokens.
- Swagger security reflects cookie auth + bearer auth options.

### 2026-01-12 — Doc health fixes
- Removed emojis from canonical docs and normalized tone where required.
- Created ADR 005 for token refresh persistence.

### 2026-01-18 — Security and auth hardening
- Added OAuth `state` validation and tests.
- Encrypted OAuth tokens at rest using `TOKEN_ENCRYPTION_KEY`.
- Auth middleware now returns after invalid token responses.
- Redacted `confirmActions` logs (no email IDs).
- `/api/v1/suggestions` now uses `reply.send` serialization.
- Added tests for encryption failure cases.

### 2026-01-19 — CI added and lint fixed
- Added GitHub Actions CI (lint + test) for PRs and `develop`.
- Added eslint config so CI lint step runs.

### 2026-03-09 — `/api/v1/notifications/events` revalidated
- Added a real route/service integration test for `/api/v1/notifications/events` using auth, pagination, filters, and authenticated-user fallback when `userId` is omitted.
- Fixed the route response schema so event `summary` payloads keep their real fields instead of being serialized as empty objects.
- Confirmed the open HU17 risk is no longer the events feed contract itself; the remaining risk is timezone semantics for summary windowing based on persisted `createdAt`.
- Removed dead `src/queries/notifications/getEventsQuery.js` to avoid a false implementation path for the events feed.

### 2026-03-09 — HU17 closed
- Defined the temporal contract for `/api/v1/notifications/summary`: `daily` = rolling last 24 hours UTC, `weekly` = rolling last 7 days UTC, both over persisted `NotificationEvent.createdAt`.
- Added `tests/getNotificationSummaryForUser.test.js` to verify UTC window boundaries, inclusive behavior, and all-time fallback when `period` is omitted.
- Updated API and event contract docs so the remaining ambiguity around summary time windows is gone.

### 2026-03-10 — Backend checkpoint refreshed
- Revalidated the full backend Jest suite at 15 suites / 55 tests.
- Updated `PROJECT_STATE.md` and `README_REENTRY.md` so the next backend task is anchored to the current n8n no-op listener checkpoint.

### 2026-03-10 — HU19 registered
- Registered a backend feature candidate for Inbox direct and bulk actions after confirming the current mismatch between notifications route enum, service behavior, and API documentation.
- Backend next step now points to defining the HU19 contract before implementation.

### 2026-03-10 — ADR 007 proposed
- Proposed a dedicated contract for Inbox direct actions instead of reusing `POST /api/v1/notifications/confirm`.
- Backend next step now points to implementing the proposed Inbox-action flow after contract review.

### 2026-03-10 — HU19 backend contract implemented
- Added `POST /api/v1/inbox/actions` with a dedicated controller and service, separate from suggestion confirmation.
- Added targeted tests for the Inbox-action service and route contract.
- Accepted ADR 007 and added an ActionHistory enum migration for `mark_unread`.

### 2026-03-10 — HU19 local Inbox seam added
- `/api/v1/emails` now resolves its Inbox source through a provider seam instead of talking to Gmail directly inside the controller.
- Added a deterministic fixture Inbox source for `e2e-user@example.com` so local/E2E runs can validate HU19 without Gmail or live OAuth.
- Added a helper script to mint local `session_token` cookies for the same E2E user.

### 2026-03-10 — HU19 row-level browser flow validated
- The React row-level Inbox flow now passes local Playwright validation for `archive`, `delete`, and `mark_unread` against the fixture Inbox source and the dedicated `/api/v1/inbox/actions` contract.
- Backend risk remains limited to stubbed Gmail side effects and the pending bulk-action slice.

### 2026-03-10 — HU19 bulk semantics frozen
- Added ADR 008 to define partial-success semantics, per-item result reporting, and local reconciliation rules for bulk Inbox actions.
- Backend next step now points to implementing the bulk response contract before widening the browser suite.

### 2026-03-10 — HU19 bulk backend contract updated
- `/api/v1/inbox/actions` now returns ADR 008 fields for bulk execution: `execution`, `summary`, and `results`.
- Added targeted backend tests for `full`, `partial`, `none`, and systemic outcomes.

### 2026-03-11 — HU19 bulk frontend now consumes ADR 008
- The React Inbox bulk slice now calls `/api/v1/inbox/actions` with multi-select actions and local reconciliation based on `results`.
- The remaining HU19 gap is browser validation of the new bulk scenarios against the fixture Inbox environment.

### 2026-03-11 — HU19 closed locally
- The full Playwright Inbox suite passed locally against the fixture Inbox source for 3 row-level and 3 bulk scenarios.
- Backend contract and frontend behavior now align for the complete local HU19 scope.
