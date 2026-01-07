## 📌 Sprint_Log.md — Backend Fastify

*(Email Cleaner & Smart Notifications — Backend)*
*Last updated: 2025-11-30 23:58 CST*

---

### 2025-11-20 — HU5 started

* ML contract v1 defined (`/v1/suggest`).
* Branch created: `feature/hu5-ml-schema-alignment`.

### 2025-11-21 — mlClient updated

* Default path switched to `/v1/suggest`.
* Payload changed to raw email arrays.

### 2025-11-21 — emailSuggester updated

* Normalized ML enriched-array output.
* Legacy mapping preserved.

### 2025-11-21 — Tests updated

* `mlClient.test.js` and `emailSuggester.test.js` adjusted for v1 contract.

### 2025-11-22 — HU5 completed

* Full backend test suite green.
* Contract v1 validated with curl.

---

### 2025-11-28 — HU12 validated

* Fastify ↔ ML integration fallback behaviour tested.
* emailSuggester fallback confirmed.

### 2025-11-28 — Merge HU5 + HU12 into `develop`

* Backend stabilized under ML v1 contract.
* All tests passing.

---

### 2025-11-30 — Documentation synchronized

* PROJECT_STATE.md backend rewritten using template.
* README_REENTRY.md backend updated.
* Sprint_Log backend updated to this point.

### 2025-12-03 — HU16 Notification Event Pipeline completed
- Added NotificationEvent model and migration.  
- getSummary() now emits and persists NEW_SUGGESTIONS events.  
- Added GET /api/v1/notifications/events feed with pagination and filters.  
- Updated tests and API documentation accordingly.

- 2025-12-05: inicio `eat-experimental-CQRS` (fbb11b8)
- 2025-12-30: `ids → emailIds`, normalización rutas internas, rename de domain events
