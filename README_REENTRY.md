# README_REENTRY.md — Backend Fastify

Email Cleaner & Smart Notifications

> Single-purpose file: allow fast reentry into the backend after a long pause, in under 2 minutes.
> This file summarizes only: branch, last HU, current state, and the next actionable step.

---

## 1. Context at Last Update

**Repository:** Backend Fastify
**Branch:** `develop`
**Commit:** `c37c6460`
**Last update:** 2025-11-20 CST
**Project scope:**

* Fastify backend (Node.js, ESM)
* PostgreSQL via Sequelize
* FastAPI ML microservice (external dependency)
* No frontend code here
* No n8n workflows versioned

The backend is stable, all tests pass, and the last completed work was HU12.

---

## 2. Last Completed User Story

### HU12 — Final Fastify ↔ ML Contract Integration

**Status:** DONE

* `/api/v1/mails` contract validated
* Gmail mock responses consistent with tests
* All tests under `mailsRoutes.test.js`, `suggestionsRoutes.test.js`, and `mlClient.test.js` passed
* API Reference aligned with behavior

No pending items for this HU.

---

## 3. Current Active User Story

### HU5 — Fastify–Python ML Contract Alignment

**Status:** IN_PROGRESS
**Reason:**
The JSON schema returned by the FastAPI classifier is not yet fully aligned with the shape consumed by `mlClient` and `/api/v1/suggestions`.

**Verified requirements:**

* `mlClient.js` handles timeouts and returns safe defaults
* Tests cover fallback behavior

**What remains:**

* Freeze and document the ML → Fastify response schema
* Update `mlClient` and tests to match the final schema

---

## 4. Verified Current System State

### Backend

* Boots locally and under `docker-compose`
* Exposes stable endpoints:

  * `GET /api/v1/mails`
  * `GET /api/v1/suggestions`
  * `GET /api/v1/notifications/summary`
  * `POST /api/v1/notifications/confirm`
  * `GET /api/v1/notifications/history`
  * `GET /api/v1/health`

### Database

* Models present: `Token`, `Notification`, `ActionHistory`
* DB connection validated at startup
* Reads/writes verified via History and Confirm endpoints

### ML Microservice

* FastAPI service reachable through `ML_BASE_URL`
* Fallback logic validated by tests

### Tests

```
All tests: passing
0 failures
```

---

## 5. How to Restart the Backend

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL + ML + backend

```bash
docker compose up
```

### 3. Run backend standalone (optional)

```bash
npm run dev
```

### 4. Verify key endpoints

```bash
curl -H "Authorization: Bearer dummy" http://localhost:3000/api/v1/mails
curl -H "Authorization: Bearer dummy" http://localhost:3000/api/v1/suggestions
```

---

## 6. Files Needed to Understand the Current Work

* `src/services/mlClient.js`
* `src/services/emailSuggester.js`
* `src/routes/suggestionsRoutes.js`
* `tests/mlClient.test.js`
* `tests/suggestionsRoutes.test.js`

---

## 7. Next Immediate Action (strict, single step)

➡️ **Align the final ML → Fastify JSON schema and update `/api/v1/suggestions` tests accordingly.**

This is the *only* next step required to resume backend work.

