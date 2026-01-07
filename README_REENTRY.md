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

- Rama de trabajo: `eat-experimental-CQRS`
- Arquitectura en transición: CQRS-lite + EventBus + catálogo `DOMAIN_EVENTS`.
- Estado de tests (último conocido, 2025-12-31):
  - FAIL — 6 suites failed / 6 suites passed (ver `PROJECT_STATE.md` para detalle).

---

## 2) Known Contract Drift Hotspots (clasificación)

### Evidencia directa (no es teoría)
1) **Tests esperan constante `DOMAIN_EVENTS.SUGGESTIONS_GENERATED`**
   - Pero el catálogo usa `SUGGESTIONS_GENERATED` → expectativa queda `undefined` y rompe aserción.

2) **Tests importan módulos ausentes**
   - `tests/emailSuggester.test.js` intenta `src/services/emailSuggester.js`
   - `tests/mailsRoutes.test.js` intenta `src/controllers/mailController.js`

3) **Notifications routes en tests responden 404**
   - Endpoints esperados: `/api/v1/notifications/*`
   - En el fixture de tests, el server no los está exponiendo (registro/import/prefijo).

### Hipótesis útiles (requieren verificación)
A) **Estamos a mitad de una migración de naming de eventos**
   - legacy: `NEW_SUGGESTIONS_EVENT` / `NEW_SUGGESTIONS`
   - nuevo: `domain.suggestions.generated`
   - Acción de verificación: definir “nombre canónico” único en `DOMAIN_EVENTS` y poner alias temporal si hace falta.

B) **El fixture de tests registra un plugin distinto o con prefijo**
   - Acción de verificación: `app.printRoutes()` en `beforeAll`.

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

