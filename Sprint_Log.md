## Sprint_Log.md — Backend Fastify

(Email Cleaner & Smart Notifications — Backend)
Last updated: 2026-03-17 03:55 CST

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

### 2026-03-13 — HU19 P1 outcome-preservation fix
- Fixed the PR #27 P1 bug where `ActionHistory.bulkCreate` persistence errors rewrote already-computed Inbox item outcomes into blanket `system_error` failures.
- `src/services/inboxActionsService.js` now preserves the computed `results`, `summary`, and `execution` values after post-action persistence failures, while logging the persistence problem server-side.
- Updated ADR 008, `docs/API_REFERENCE.md`, and targeted Jest coverage in `tests/inboxActions.test.js`; `tests/inboxActions.test.js` and `tests/inboxActionsRoutes.test.js` both passed locally.

### 2026-03-14 — HU19 backend merged to develop
- Merged the HU19 backend branch into `develop` after the PR #27 P1 fix, the GitHub Actions Node 24-compatibility update, and the backend governance-doc alignment all cleared review and CI.
- Backend user-story tracking now treats HU19 as closed on `develop` for the documented local/browser scope; the next backend step is no longer a HU19 branch response.

### [2026-03-15] Session Close
- **Done:** - Implemented transactional close-session apply order
- Verified active repo scope before write
- **Learned:** Transactional close-session can prepare anchored doc updates before applying them in ordered writes
- **Status:** PAUSADA
- **Next:** Review transactional close-session output and decide whether to expand anchor coverage

### [2026-03-15] Session Close
- **Done:** Hardened Sprint_Log multiline formatting
- **Done:** Improved repo scope fallback to a single dirty repo
- **Learned:** Scope resolution should prefer concrete dirty repo evidence
- **Learned:** Multiline log input must be normalized before append
- **Status:** PAUSADA
- **Next:** Review hardening output and decide whether repo_scope needs explicit override support

### 2026-03-16 — HU_01 rules_v1 slice implemented
- Added `src/services/receiptDetection/electricityReceiptClassifier.js` as a backend-only local classifier for electricity-bill detection using `subject`, `sender`, and `body`.
- Added `tests/electricityReceiptClassifier.test.js` with the agreed 8-case simulated dataset plus invalid-input coverage.
- Fixed two blocking rule issues during implementation: ambiguous emails no longer fall through to `not_invoice`, and work-email negatives now return `medium` confidence instead of `high`.
- Verified the targeted Jest command `npm test -- electricityReceiptClassifier.test.js` passes locally with 9/9 tests.

### 2026-03-17 — HU_01 mixed-signal false-positive fix
- Added a targeted regression test for emails that combine strong negative cues with electricity-related sender/content signals.
- Updated `src/services/receiptDetection/electricityReceiptClassifier.js` so mixed-signal cases fall back to `unknown` instead of over-classifying to `invoice_electricity`.
- Verified the targeted Jest command `npm test -- electricityReceiptClassifier.test.js` passes locally with 10/10 tests.

### 2026-03-17 — HU_01 integrated on develop
- PR #32 was merged into `develop`, so the backend-only `rules_v1` electricity-receipt detector is no longer a pending feature branch checkpoint.
- The backend checkpoint now treats HU_01 as integrated state, and the next documented backend step is freezing HU_02 as a scoped extraction spike before implementation.

### [2026-03-15] Session Close
- **Done:** Hardened Sprint_Log multiline formatting
- **Done:** Improved repo scope fallback to a single dirty repo
- **Learned:** Scope resolution should prefer concrete dirty repo evidence
- **Learned:** Multiline log input must be normalized before append
- **Status:** PAUSADA
- **Next:** Review hardening output and decide whether repo_scope needs explicit override support
### 2026-03-17 — HU_02 receipt-detection route landed
- Added POST `/api/v1/receipt-detection/extract` with a thin controller/service wiring that uses `src/services/receiptDetection/electricityInvoiceExtractor.js` and returns `{ amount, due_date }` with `null` fallback for ambiguous/negative/empty inputs.
- Added `tests/receiptDetectionRoutes.test.js` pointing at `tests/fixtures/receiptDetection/` to cover positive/ambiguous/negative/empty behaviors plus the invalid payload 400 case.
- Route now lives independently of `spikes/hu02-extraction/`, which is kept as historical reference only.

### 2026-03-17 — HU_03 WhatsApp delivery backend slice closed
- Added `src/routes/notificationDeliveryRoutes.js`, `src/controllers/notificationDeliveryController.js`, `src/services/notifications/receiptNotificationService.js`, and `src/services/notifications/twilioAdapter.js` to deliver `{ amount, due_date }` safely over WhatsApp when the extractor returns both fields.
- Logged send attempts via `src/services/notifications/notificationDeliveryLogService.js` and kept Twilio interactions deterministic while requiring valid `phone` payloads.
- Added fixtures under `tests/fixtures/notifications/` and targeted tests covering adapter validation, service skips/errors, and the route contract (`tests/notificationDeliveryRoutes.test.js`) so the real route and adapter now have production-grade regression coverage.
- Route is exposed at `POST /api/v1/notifications/receipt-whatsapp`, reusing `receiptNotificationService` rather than re-running HU_02 extraction, and keeps `spikes/hu02-extraction/` as historical context only.

### 2026-03-19 — HU_05 backend prerequisite landed
- Added ADR 009 and authenticated `GET /api/v1/emails/:id/content` so the frontend can fetch normalized full email content by `emailId` without changing `GET /api/v1/emails`, receipt extraction, or WhatsApp delivery.
- Extended `src/services/gmailService.js`, `src/services/inboxSources/gmailInboxSource.js`, and `src/services/inboxSources/fixtureInboxSource.js` with minimal full-content retrieval support.
- Verified the slice with targeted Jest coverage in `tests/emailsRoutes.test.js`, `tests/emailsFixtureRoutes.integration.test.js`, and `tests/gmailService.test.js`.

### 2026-03-22 — HU06 local fixture support for browser validation
- Updated `src/services/inboxSources/fixtureInboxSource.js` so the deterministic E2E emails now contain extractor-ready receipt bodies with amount and delimited due-date values.
- Revalidated the fixture content contract with `tests/emailsFixtureRoutes.integration.test.js`, keeping the backend HTTP surface unchanged while enabling the local browser receipt-review flow.

### 2026-03-22 — HU06 fixture dataset decoupled from HU19
- Added dedicated HU06 receipt-review emails to `src/services/inboxSources/fixtureInboxSource.js` so browser validation no longer depends on HU19 row IDs or content.
- Extended `tests/emailsFixtureRoutes.integration.test.js` to assert the HU06 provider-error content route explicitly.

### 2026-03-22 — Husky and commitlint hooks added
- Added versioned `.husky/pre-commit` and `.husky/commit-msg` hooks plus `.commitlintrc.cjs`.
- Preserved the existing README timestamp update in `pre-commit` and confirmed that invalid Conventional Commit messages are blocked while the cognitive gate still runs.

### 2026-03-22 — CI commitlint check added
- Extended `.github/workflows/ci.yml` so pull requests now validate commit messages with `commitlint` in GitHub Actions.

### 2026-03-22 — Husky hook portability fix
- Replaced the workspace-root `pre-commit` dependency with repo-local scripts under `scripts/git-hooks/`, preserving the README timestamp update while making the versioned hook portable to a clean standalone clone of `email-cleaner-fastify`.
- Replaced `prepare: "husky"` with a guarded installer so `npm ci --omit=dev` now succeeds without devDependencies while normal dev installs still configure `.husky/_`.

### 2026-03-22 — Comment hygiene wired into Fastify pre-commit
- Added `scripts/git-hooks/check-comment-hygiene.sh` and wired it into the repo-local Husky `pre-commit` flow.
- The Fastify hook now blocks empty comments and vague `TODO` / `FIXME` markers before commit without depending on the workspace-root helper script.

### 2026-03-22 — Comment hygiene findings cleared in Fastify
- Removed the four empty `//` separator comments that the new Fastify comment-hygiene gate was correctly blocking in existing service and test files.
- Revalidated the repo-local Husky `pre-commit` flow; it now passes with `comment-hygiene: OK`.
