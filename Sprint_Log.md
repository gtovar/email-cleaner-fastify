## Sprint_Log.md — Backend Fastify

(Email Cleaner & Smart Notifications — Backend)
Last updated: 2026-01-11 17:44 CST

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
