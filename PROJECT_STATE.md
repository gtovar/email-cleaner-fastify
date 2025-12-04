# 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
SNAPSHOT_DATE: 2025-12-04 02:36 CST
BRANCH: feature/hu16-notification-event-pipeline
COMMIT: 288b96497b6f6eaa0f2a0c3998be0fe3d33f7c5d
ENVIRONMENT: Local development (docker-compose + npm test)

Notes:

* This snapshot reflects ONLY the Fastify backend repository.
* Python ML microservice, React frontend, and n8n automations are external components.

---

# 2. Executive Summary

This snapshot reflects the real backend state after merging HU5 and HU12 into `develop`.
Fastify boots correctly with PostgreSQL and the ML microservice.
The ML contract `/v1/suggest` is active and validated via `mlClient.js`.
All backend routes are stable and tested using Jest.
Email suggestion flow, notification history, and action confirmation are fully operational.
No failing tests or broken contracts were detected for this snapshot.

---

# 3. Component-by-Component Technical State

## 3.1 Fastify Backend

* Code structure under: `src/`
* Active endpoints:

  * `GET /api/v1/health`
  * `GET /api/v1/mails`
  * `POST /api/v1/suggestions`
  * `POST /api/v1/notifications/confirm`
  * `GET /api/v1/notifications/history`
  * `GET /api/v1/notifications/summary`
* Passing Jest tests:

  * `tests/suggestionsRoutes.test.js`
  * `tests/notificationsRoutes.test.js`
  * `tests/authMiddleware.test.js`
  * `tests/googleAuthService.test.js`
  * `tests/emailSuggester.test.js`
  * `tests/mlClient.test.js`
* Infra status:

  * Dockerized Postgres and ML service working under `ops/docker-compose.yml`.

---

## 3.2 ML Microservice (FastAPI)

* Code present in `python/classifier/`
* Active route:

  * `POST /v1/suggest`
* Behaviour:

  * Accepts enriched email objects with validated fields.
  * Returns normalized `suggestions` list.
* Fallback:

  * If ML is unreachable, Fastify returns suggestions: `[]` (mlClient fallback behaviour).
* Tests:

  * Python service validated manually and through backend contract tests.

---

## 3.3 React Frontend (External Component)

* Not part of this repo, but validated through integration:

  * Uses `/api/v1/suggestions`
  * Uses `/api/v1/notifications/history`
  * Uses `/api/v1/notifications/confirm`
* No inconsistencies detected between frontend expectations and backend responses.

---

## 3.4 PostgreSQL Database

* Models detected:

  * `Notification`
  * `ActionHistory`
  * `Token` (used for Gmail OAuth)
* Migrations applied and consistent.
* Relations validated in runtime.
* Active through Docker.

---

## 3.5 n8n (optional)

* Not active for this snapshot.
* No workflows present in backend repo.

---

## 3.6 Docker Infrastructure

* docker-compose services active:

  * fastify
  * postgres
  * python-ml-service
* Makefile:

  * present for automation tasks.
* Required env files:

  * `.env`
  * `.env.example`

---

# 4. User Story Status (Evidence-Driven)

### HU3 — Notifications API

**Estado:** DONE

**Evidencia comprobable:**

* Endpoints:

  * `/api/v1/notifications/summary`
  * `/api/v1/notifications/confirm`
  * `/api/v1/notifications/history`
* Models: `Notification.js`, `ActionHistory.js`
* Tests: `notificationsRoutes.test.js` (green)
* Actions persist to DB confirmed by tests.

**Pendientes:** none
**Riesgos técnicos:** none
**Decisión o cambio reciente:** Marked DONE after validating DB persistence and contract stability.

---

### HU6 — Mail Summary + Legacy Suggestion Bridge

**Estado:** DONE

**Evidencia comprobable:**

* Legacy suggestion endpoint operational.
* Tests: `suggestionsRoutes.test.js` (green)
* Demo summary data confirmed functional.

**Pendientes:** none
**Riesgos técnicos:** none
**Decisión o cambio reciente:** Closed after validating legacy flow before ML adoption.

---

### HU12 — Fastify ↔ ML Integration (v0)

**Estado:** DONE

**Evidencia comprobable:**

* Fastify communicates with Python ML service.
* Tests validate fallback behaviour when ML is unreachable.
* Evidence: `emailSuggester.test.js`.

**Pendientes:** none
**Riesgos técnicos:** none
**Decisión o cambio reciente:** Replaced by HU5 full v1 contract.

---

### HU5 — ML Schema Alignment (v1 Contract)

**Estado:** DONE

**Evidencia comprobable:**

* Updated endpoint `/v1/suggest` consumed by mlClient.
* Payload structure aligned with ML v1 contract.
* Tests:

  * `mlClient.test.js`
  * `emailSuggester.test.js`
* Live validation via curl.

**Pendientes:** none
**Riesgos técnicos:** low schema-validation strictness.
**Decisión o cambio reciente:** Marked DONE after confirming stable v1 contract.

---

### HU16 — Notification Event Pipeline (Phase 1)

STATUS: Done

EVIDENCE:
- Model `NotificationEvent` defined in `src/models/notificationEvent.js` and registered in `src/plugins/sequelize.js`.
- Migration `migrations/20251118000000_create_notification_events.cjs` creates the `NotificationEvents` table with timestamps.
- Service `notificationEventsService` in `src/services/notificationEventsService.js` providing a `record()` function to persist events.
- `notificationsService.getSummary()` in `src/services/notificationsService.js` builds `NEW_SUGGESTIONS_AVAILABLE` events via `buildNewSuggestionsEvent` / `createNewSuggestionsEvent` and persists them when suggestions exist.
- HTTP endpoint `GET /api/v1/notifications/events` defined in `src/routes/notificationsRoutes.js`, with pagination (`page`, `perPage`) and filters (`type`, `userId`).
- Controller `listEvents` in `src/controllers/notificationEventsController.js` used by the events endpoint.
- Tests:
  - `tests/notifications.test.js` validating automatic emission and persistence of `NEW_SUGGESTIONS_AVAILABLE` events from `getSummary()`.
  - `tests/notificationsRoutes.test.js` validating the contract of `GET /api/v1/notifications/events` (auth, query parameters, response shape).
- API contract documented in `docs/API_REFERENCE.md` under section `4.4 GET /api/v1/notifications/events`.

PENDING:
- None for Phase 1. Event deduplication, `processedAt` handling and n8n consumption will be covered by future HUs.

RISKS:
- Consumers like n8n may re-process the same events if they do not implement their own cursor or time-based filtering.
- `userId` still relies on the `demo-user` fallback until a real identity is available via HU17 (OAuth2 / Gmail integration).

DECISION:
- Marked as Done after verifying that the model, migration, event builder, service, summary integration, events endpoint, tests and API documentation are all present and consistent in the current backend repository.

---
# 5. Current Technical Risks

* No end-to-end workflow tests covering Fastify → ML → DB (medium)
* ML payload validation not fully strict (low)
* No rate limiting on suggestion endpoints (low)
* No schema version negotiation with ML service (low)

---

# 6. Next Immediate Action

➡️ **Run full backend test suite to confirm all contracts are still stable:**

```
npm test
```

---

# 7. Version log

* **2025-11-30 23:50 CST** — Full backend snapshot rewritten to match develop state; HU3, HU6, HU12, HU5 marked DONE with evidence; aligned with project_state_protocol_and_template.md. (commit: pending)

