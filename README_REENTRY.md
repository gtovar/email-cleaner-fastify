# README_REENTRY.md — Email Cleaner & Smart Notifications (Fastify Backend)

> Objetivo: volver al contexto en 1–2 minutos (sin leer docs largos).

## 0) Checklist de re-entrada (orden estricto)

1) Ver branch + estado:
   - `git status -sb`
2) Corre pruebas (verdad fuerte):
   - `npm test`
3) Abre el checkpoint:
   - `PROJECT_STATE.md` (estado real, factual)
4) Si algo no cuadra:
   - Busca la verdad en `src/index.js`, `src/routes/*`, `src/services/*`, `src/events/*`, `tests/*`

---

## 1) Snapshot actual (lo mínimo que importa)

- Branch: `docs/sync-truth-2026-01-08`
- Último checkpoint: `PROJECT_STATE.md` (snapshot 2026-01-08)
- Backend tests: PASS (Jest)
- Endpoints principales:
  - Gmail OAuth: `/auth/google`, `/auth/google/callback`
  - v1: `/api/v1/emails`, `/api/v1/suggestions`
  - Notificaciones: `/api/v1/notifications/summary|confirm|history|events`
- Arquitectura (hoy): CQRS-lite + EventBus in-memory + persistencia de eventos en `NotificationEvent`

---

## 2) Dónde tocar según la intención

- Agregar/ajustar endpoints: `src/routes/*` + `src/controllers/*`
- Cambiar reglas de negocio: `src/services/*` + `src/commands/*`
- Eventos / naming / listeners: `src/events/*` + `src/plugins/eventBus.js`
- Persistencia: `src/models/*` + migraciones/seeders (si aplica)
- Tests: `tests/*.test.js`

---

## 3) Comandos rápidos

### Tests
- `npm test`
- `npm run test:watch`

### Dev server
- `npm run dev`
- `npm run dev:pretty`

### DB (Sequelize CLI)
- `npm run db:migrate`

---

## 4) Reglas de documentación (para no olvidar)

- PROJECT_STATE.md: solo hechos verificables (código/tests). Un “Next Immediate Action”. Sin logs pegados.
- README_REENTRY.md: ultra corto, operativo, sin duplicados. Debe guiarte de regreso sin leer 20 archivos.
