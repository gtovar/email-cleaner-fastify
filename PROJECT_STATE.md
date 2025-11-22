# 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
SNAPSHOT_DATE: 2025-11-21 19:30 CST
COMMIT: c37c646
ENVIRONMENT: local development (docker-compose + npm run dev)

COMPONENT_SCOPE:
  - Fastify backend (Node.js, ESM)
  - ML service (FastAPI) via ML_BASE_URL
  - PostgreSQL via Sequelize
  - n8n container present (no workflows)

Notes:
- Snapshot reflects ONLY the Fastify backend repository.
- Frontend and n8n workflows live in their own repositories.

---

## 2. Executive Summary

This snapshot reflects the real, verifiable backend state at commit c37c646.

Fastify boots under docker-compose, connects to PostgreSQL, and exposes all implemented routes (mails, suggestions, notifications, health).  
HU3, HU6, HU12 are fully completed and verified by tests.  
HU5 (ML schema alignment) remains in progress due to an unfrozen classifier schema.  
Contract tests pass; fallback behaviour in mlClient is stable.

---

## 3. Component-by-Component Technical State

### 3.1 Fastify Backend

- Code present:
  - `src/routes/mailRoutes.js`
  - `src/routes/suggestionsRoutes.js`
  - `src/routes/notificationsRoutes.js`
  - `src/routes/healthRoutes.js`
  - `src/services/mlClient.js`
  - `src/services/emailSuggester.js`
  - `src/controllers/*`
  - `models/*.js`

- Working endpoints:
  - `GET /api/v1/mails`
  - `GET /api/v1/suggestions`
  - `GET /api/v1/notifications/summary`
  - `POST /api/v1/notifications/confirm`
  - `GET /api/v1/notifications/history`
  - `GET /api/v1/health`

- Passing tests:
  - `tests/mailsRoutes.test.js`
  - `tests/suggestionsRoutes.test.js`
  - `tests/notificationsRoutes.test.js`
  - `tests/authMiddleware.test.js`
  - `tests/mlClient.test.js`

- Infra status:
  - Boot verified locally + docker-compose.
  - Dynamic routes registered via Fastify plugins.

---

### 3.2 ML Microservice (FastAPI)

- Active via `ML_BASE_URL`.
- Called by `src/services/mlClient.js`.
- Fallback behaviour (timeout/error → safe defaults) validated by tests.
- Classifier JSON schema not yet frozen → affects HU5.

---

### 3.3 React Frontend

- Not part of this repository.

---

### 3.4 PostgreSQL Database

- Models detected:
  - `models/Token.js`
  - `models/Notification.js`
  - `models/ActionHistory.js`

- Migrations:
  - Managed via Sequelize; schema inferred from models.

- DB status:
  - Active through docker-compose.
  - Verified through tests + startup logs.

---

### 3.5 n8n

- Service exists in docker-compose.
- No workflows versioned.
- No integration with Fastify yet.

---

### 3.6 Docker Infrastructure

- Active containers:
  - fastify
  - fastapi
  - db
  - n8n

- env files:
  - `.env.example` defines ML_BASE_URL and DB credentials.

---

## 4. User Story Status (Evidence-Driven)

### HU3 — Notifications API

**Status:** DONE

**Evidence:**
- Routes implemented:
  - `/api/v1/notifications/summary`
  - `/api/v1/notifications/confirm`
  - `/api/v1/notifications/history`
- Models:
  - `models/Notification.js`
  - `models/ActionHistory.js`
- Controllers:
  - `src/controllers/notificationsController.js`
  - `src/controllers/actionHistoryController.js`
- Tests:
  - `tests/notificationsRoutes.test.js`

**Pending:** none  
**Technical risks:** none  
**Decision:** Marked DONE after verifying routes and persistence via tests.

---

### HU6 — Confirm + History Persistence

**Status:** DONE

**Evidence:**
- Confirm endpoint writes `ids` + `action` to ActionHistory.
- History endpoint returns paginated records.
- Models:
  - `models/ActionHistory.js`
- Tests:
  - `tests/notificationsRoutes.test.js`

**Pending:** none  
**Technical risks:** none  
**Decision:** Marked DONE after persistence + tests validated.

---

### HU5 — Fastify–Python ML Contract

**Status:** IN_PROGRESS

**Evidence:**
- `src/services/mlClient.js` calls ML classifier.
- `GET /api/v1/suggestions` integrates ML results.
- Tests:
  - `tests/mlClient.test.js`
  - `tests/suggestionsRoutes.test.js`

**Pending:**
- Freeze final JSON schema from the FastAPI classifier.
- Align field names and shapes expected by `mlClient`.

**Technical risks:**
- Mismatch between classifier schema and Fastify contract.

**Decision:** Remains IN_PROGRESS because ML schema is not finalized.

---

### HU12 — Mails API Final Contract

**Status:** DONE

**Evidence:**
- `/api/v1/mails` implemented in `src/routes/mailRoutes.js`.
- Tests:
  - `tests/mailsRoutes.test.js`

**Pending:** none  
**Technical risks:** none  
**Decision:** Marked DONE after contract stabilized and tests passed.

---

## 5. Current Technical Risks

- ML contract mismatch (HU5).
- No end-to-end tests across Fastify + ML + DB.
- Limited validation on ML response shape.

---

## 6. Next Immediate Action

➡️ Freeze and align the ML classifier response schema with the `mlClient` contract, then update the suggestions tests accordingly.

---

## Version log

- 2025-11-21 19:30 CST — Full rewrite aligned to protocol v1.0 (commit: c37c646)

