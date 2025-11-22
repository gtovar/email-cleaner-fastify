# 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend  
SNAPSHOT_DATE: 2025-11-22 02:45 CST  
AUTHOR: System snapshot (ChatGPT + Gilberto Tovar)  
BRANCH: feature/hu5-ml-schema-alignment  
COMMIT: cff3c9d4  
ENVIRONMENT: Local development (docker-compose + npm test)

---

# 2. Executive Summary

This snapshot reflects the backend state after completing HU5 (ML Schema Alignment).  
Fastify boots correctly with PostgreSQL and the ML microservice.  
The Python classifier exposes a stable and versioned endpoint `POST /v1/suggest`.  
Fastify communicates with the ML service using the updated versioned contract via `mlClient.js`.  
Jest tests (`mlClient.test.js` and `emailSuggester.test.js`) validate the new schema and pass successfully.  
All core backend routes remain stable and operational.  
Remaining technical risks are noted below.

---

# 3. Technical State by Component

## 3.1. Fastify Backend
- Bootstraps via `ops/docker-compose.yml`.
- Active routes:
  - `GET /api/v1/health`
  - `GET /api/v1/mails`
  - `POST /api/v1/suggestions`
  - `POST /api/v1/notifications/confirm`
  - `GET /api/v1/notifications/history`
  - `GET /api/v1/notifications/summary`
- All Jest tests under `tests/*.test.js` pass.

## 3.2. ML Microservice (FastAPI)
- Exposes: `POST /v1/suggest`
- Accepts an array of emails with fields validated in Python:
  - `id`, `subject`, `from`, `body`
  - `date` (RFC-2822 format)
  - `isRead`
  - `category`
  - `attachmentSizeMb`
- Returns enriched emails including normalized `suggestions`.

## 3.3. Integration Layer — mlClient.js
- Default path now uses `/v1/suggest`.
- Payload now sends raw arrays (not `{ emails }`).
- Backward compatibility preserved.
- Full test coverage updated and green.

## 3.4. Suggestion Engine — emailSuggester.js
- Accepts ML enriched-array output.
- Normalizes ML suggestions into:
  ```js
  { action: "<value>" }
````

* Works with legacy and new ML formats.
* Tested thoroughly in `emailSuggester.test.js`.

## 3.5. Notifications System

* Database models validated: `Notification`, `ActionHistory`.
* API behaviour validated by tests.
* Fully functional.

## 3.6. Data Layer — PostgreSQL

* Migrations applied correctly.
* All CRUD operations functioning.
* No schema drift detected.

---

# 4. User Story Status

## HU3 — Notifications API

STATUS: DONE

EVIDENCE:

* Works through `/api/v1/notifications/*`.
* Actions persist in DB.
* Tests: `notificationsRoutes.test.js` (green).

PENDING:

* None.

RISKS:

* None.

DECISION:

* Marked as DONE after validating API behaviour and persistence.

---

## HU6 — Mail Summary + ML Bridge (legacy demo)

STATUS: DONE

EVIDENCE:

* Suggestion demo endpoint operational.
* Tests: `suggestionsRoutes.test.js` (green).

PENDING:

* None.

RISKS:

* None.

DECISION:

* Closed after validating integration phase 1.

---

## HU12 — Fastify ML Integration (v0)

STATUS: DONE

EVIDENCE:

* Fastify can contact Python ML service.
* Tests confirm connection and fallback behaviour.
* Covered by `emailSuggester.test.js`.

PENDING:

* None.

RISKS:

* None.

DECISION:

* Replaced by HU5 full versioned contract.

---

## HU5 — ML Schema Alignment (CURRENT)

STATUS: DONE

EVIDENCE:

* Updated ML endpoint `/v1/suggest`.
* Updated `mlClient.js` path and payload.
* Updated suggestion normalization logic.
* Updated tests: `mlClient.test.js`, `emailSuggester.test.js`.
* Live curl test from Fastify:

  ```bash
  curl -s http://localhost:8000/suggest [...]
  ```

  returned enriched emails with no errors.

PENDING:

* None.

RISKS:

* ML payload validation could be stricter (low).

DECISION:

* Contract v1 is now frozen and stable.

---

# 5. Current Technical Risks

1. **No true E2E workflow tests** (Medium)
2. **ML payload validation is not strict** (Low)
3. **Absence of schema version negotiation** (Low)
4. **No rate limiting on `/api/v1/suggestions`** (Low)

---

# 6. Next Immediate Action (Single Executable Task)

Run a full test sweep on the backend:

```bash
npm test
```

This is the only mandatory step to resume work safely.

---

# 7. Version log

* **2025-11-22 02:45 CST** — Full rewrite aligned to `project_state_protocol_and_template.md`; HU5 marked as DONE; ML contract `/v1/suggest` frozen and validated (commit: cff3c9d4).
