# README_REENTRY.md — Fastify Backend (Re-entry in 5–10 minutes)

Last updated: 2025-12-31 (America/Monterrey)

This file is the operational anchor to resume work quickly.
Canonical truth snapshot lives in `PROJECT_STATE.md`.

---

## 0) Re-entry checklist (do this first)

1) Confirm branch + commit
2) Run tests (do not assume green)
3) Identify whether failures are “legacy drift” vs “real regressions”
4) Only then touch docs/contracts

---

## 1) Current truth snapshot (Evidence-based)

- Repo: `email-cleaner-fastify`
- Branch: `eat-experimental-CQRS`
- HEAD commit (from your current branch narrative): `fbb11b8` — "Experimental apply CQRS"
- Test command executed:
  - `npm test` (Jest with `NODE_OPTIONS=--experimental-vm-modules`)
- Test results (from provided test output):
  - Test Suites: **6 failed, 6 passed (12 total)**
  - Tests: **9 failed, 21 passed (30 total)**
  - Non-fatal warning: `ExperimentalWarning: VM Modules is an experimental feature`

IMPORTANT:
- Do not claim “tests passing” unless you re-ran `npm test` and confirmed the same (or better).

---

## 2) Quick commands (local)

From repo root:

```bash
nvm use 22
npm install
npm test
npm run dev:pretty














Last updated: 2026-01-02 (America/Monterrey)
# README_REENTRY — Email Cleaner & Smart Notifications (Fastify)

Objetivo: retomar el proyecto en 5–10 minutos con un estado verificable (sin depender de memoria).

---

## 0) Re-entry Checklist (orden estricto)

1) **Ver rama y estado**
   - `git branch --show-current`
   - `git status`

2) **Leer el checkpoint**
   - Abrir `PROJECT_STATE.md` (este archivo manda el “qué es verdad hoy”).

3) **Correr pruebas y registrar resultado**
   - `npm test`
   - Si cambia el resultado, actualizar `PROJECT_STATE.md` → sección **Test Status (PASS/FAIL)**.

4) **Levantar servidor (solo si aplica)**
   - `npm run dev:pretty`
   - Healthcheck: `GET /api/v1/health/db`

5) **Revisar docs canónicos (si hubo drift)**
   - `docs/API_REFERENCE.md`
   - `docs/events_contract.md`
   - `docs/architecture.md`

---

## 1) Current Truth Snapshot (lo mínimo que importa)

- Rama de trabajo: docs/sync-truth-2026-01-08
- Commit verificado: b9fff3c
- Estado de tests (verificado, 2026-01-08):
  - PASS — 12 suites / 40 tests (`npm test`)
- Puntos de verdad:
  - Confirmación: `POST /api/v1/notifications/confirm`
  - Historial: `GET /api/v1/notifications/history`
  - Event store: `GET /api/v1/notifications/events`

---

## 2) Known Contract Drift Hotspots

- Ninguno conocido (2026-01-08) con tests en PASS.
- Si algo falla: correr `npm test` y revisar primero `PROJECT_STATE.md` (Test Status + Evidence).


---

## 3) Canonical Docs Map (no inflar)

- **Estado del sistema:** `PROJECT_STATE.md` (checkpoint verificable)
- **Cómo retomar:** `README_REENTRY.md` (este archivo)
- **HTTP contrato:** `docs/API_REFERENCE.md`
- **Contrato de eventos:** `docs/events_contract.md`
- **Arquitectura y flujos:** `docs/architecture.md`
- **Decisiones mayores:** `docs/adr/*` (ADRs)

---

## 4) Quick Commands

```bash
# Tests
npm test

# Dev server
npm run dev:pretty

# (Opcional) Ver rutas registradas (si agregas printRoutes en tests o server)
# app.printRoutes()

