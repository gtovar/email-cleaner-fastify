# PROJECT_STATE – Email Cleaner & Smart Notifications

> Documento de estado vivo. Solo debe contener información **comprobable**
> a partir de código, tests y documentación actual.

---

## 1. Contexto general

- **Repositorio:** email-cleaner-fastify
- **Backend principal:** Node.js + Fastify
- **Servicios extra:** FastAPI (Python classifier), PostgreSQL, n8n
- **Infra:** Docker Compose (`ops/docker-compose.yml`), `ops/Makefile`,
  Cloud Build / Cloud Run (documentados), MkDocs para docs.
- **Fecha de este snapshot:** 2025-11-14

### 1.1. Ramas

- `main`  
  - Rama estable actual.

- `develop`  
  - Rama de trabajo activo (se crea feature branches desde aquí).

- `feature/hu11-jest-runner`  
  - Rama usada para migrar el test runner a Jest.  
  - Debe mergearse a `develop` y luego a `main` al cerrar la HU11.

---

## 2. Estado por Historias de Usuario (HU)

> Estados posibles: `DONE`, `EN_CURSO`, `BACKLOG_FASE_2`, `NO_INICIADA`.

### HU1 – Autenticación con Gmail

- **Estado:** EN_CURSO (implementada a nivel de código base, falta cierre formal).
- **Evidencia:**
  - Rutas `/auth/google` y `/auth/google/callback` en `authRoutes.js`.
  - Controlador `authController.js` usando `googleapis` + modelo `Token`.  
- **Pendientes:**
  - Tests de integración del flujo OAuth.
  - Mock/estrategia clara para entorno local sin secretos reales.

### HU2 – Limpieza básica de correos

- **Estado:** DONE
- **Evidencia:**
  - Controlador `mailController.js` que lista correos de Gmail con filtros.
  - Utilidad `buildGmailQuery` en `src/utils/filters.js`.
  - Documentación en `docs/API_REFERENCE.md` y `docs/TUTORIALS/QUICKSTART.md`.

### HU3 – Notificaciones (summary / confirm / history)

- **Estado:** DONE
- **Evidencia:**
  - Modelos `Notification` y `ActionHistory`.
  - Rutas `/api/v1/notifications/summary`, `/confirm`, `/history`
    en `src/routes/notificationsRoutes.js`.
  - Servicios `notificationsService` y `actionHistoryService`.
  - Pruebas en `tests/notifications.test.js` (Jest) pasando en verde.
- **Notas:**
  - Flujo pensado para demo con usuario `demo-user` y token dummy.

### HU4 – Panel UI de usuario (React)

- **Estado:** BACKLOG_FASE_2
- **Evidencia:** componentes React existen, pero la HU no está formalmente
  cerrada ni completamente documentada.

### HU5 – Integración con microservicio de clasificación en Python

- **Estado:** EN_CURSO (Sprint S-03 — HU5 Contrato Fastify ↔ Python classifier).
- **Evidencia:** servicio Python, referencia en `emailSuggester.js` y sección 5 de `docs/API_REFERENCE.md`.
- **Pendientes:** tests de contrato (Fastify ↔ FastAPI) y verificación end-to-end con Docker Compose.
- ✅ Última tarea completada: contrato Fastify ↔ Python documentado en `docs/API_REFERENCE.md`.

### HU6–HU10

- **Estado:** BACKLOG_FASE_2
- Reservadas para:
  - Reglas avanzadas
  - Integración n8n real
  - Mejora de UI / UX
  - Observabilidad / métricas
  - Hardening de seguridad

### HU11 – Migración de Test Runner a Jest

- **Estado:** DONE
- **Evidencia:**
  - `package.json` con scripts:
    - `npm test`
    - `npm run test:watch`
    - `npm run coverage`
  - Config de Jest en `package.json`:
    ```json
    "jest": {
      "testEnvironment": "node",
      "transform": {}
    }
    ```
  - Pruebas migradas y en verde:
    - `tests/filters.test.js`
    - `tests/emailSuggester.test.js`
    - `tests/mailService.test.js`
    - `tests/notifications.test.js`
  - Documentación en `docs/testing.md`.
  - ADR-003 en `docs/adr/003-adoption-jest.md` con estado `accepted`.
  - `Sprint_Log.md` con Sprint S-02 documentando HU11.

---

## 3. Componentes técnicos y estado

### 3.1. Backend Fastify

- **Status:** 🟢 Funcional.
- Plugins, rutas y servicios principales operativos.
- Healthcheck `/api/v1/health/db` y Swagger en `/docs`.

### 3.2. Microservicio Python (clasificador)

- **Status:** 🟡 Usable como demo, pendiente endurecer contrato y tests.
- Se llama vía `src/services/emailSuggester.js` → `FASTAPI_URL /suggest`.

### 3.3. Frontend React

- **Status:** 🟡 En curso (panel de notificaciones y confirmaciones).
- Falta consolidar historia HU4 y documentar flujos completos.

### 3.4. n8n / Orquestación

- **Status:** 🔵 Planeado.
- Servicio definido en `ops/docker-compose.yml`, integración funcional básica
  pendiente de diseño detallado.

---

## 4. Riesgos y decisiones abiertas

1. **OAuth Google en local y en producción**
   - Necesita estrategia clara de mock / entorno de pruebas.
2. **Contrato Node ↔ Python**
   - Node side: request/response schema and contract tests are in place
     (`emailSuggester.js`, `/api/v1/suggestions`, notifications routes).
   - Pending: end-to-end tests against the real FastAPI classifier and
     Docker Compose orchestration (Fastify ↔ FastAPI ↔ DB).
3. **Cobertura de pruebas**
   - Jest está integrado, pero el número de casos aún es pequeño.

---

## 5. 🎯 Objetivo actual


- Priorizar HU1 (OAuth Google) y HU6 (React suggestions UI) as the next candidates
  for implementation.
- HU5 (Python classifier integration) is closed at the Fastify–Node contract level;
  remaining work is end-to-end integration (FastAPI + Docker) and optional
  Python-side contract tests.

---

## 6. Próximo paso recomendado

1. Hacer merge de `feature/hu11-jest-runner` → `develop` → `main`.
2. Decidir en `Features & Roadmap` si la siguiente HU prioritaria será:
   - HU1 (cerrar completamente OAuth Google con tests), o
   - HU5 (formalizar contrato y flujo con el clasificador Python).



notas: o único “detalle nerd” que vale la pena notar (no arreglar todavía, solo tener en el radar):

En EmailSuggestion, suggestions está tipado como string[].

Pero en la documentación de emailSuggester y del clasificador Python, la forma “ideal” de cada sugerencia es un objeto { action, category, confidence_score }.
