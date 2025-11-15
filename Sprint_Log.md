# Sprint Log

## Sprint S-01 — HU3 Notificaciones

**Periodo:** (Fecha de esta conversación)

### Objetivo

Validar y documentar la funcionalidad completa de notificaciones:

* summary
* confirm
* history

### Hecho

* Migraciones creadas y aplicadas.
* Endpoints probados correctamente.
* Frontend confirm-button funcionando.
* Documentación API actualizada.
* Estructura documental planificada (reentry, state, ADRs).

### Pendiente

* Correcciones menores en tests unitarios.
* Cerrar HU3.

### Riesgos

Bajo: alineación test runner vs Jest (HU11).

### Decisiones

Ver `docs/adr/001-gmail-auth-choice.md` y `docs/adr/002-backend-framework.md`.

```


Agregar entrada a Sprint_log

Línea estilo:

Fecha / hora.

“Cierre formal de HU3 (notifications tests/docs).”

“Branch feature/hu3-notifications-tests-docs eliminado del remoto.”

“Se decide repriorizar HU11: migración a Jest, HU4–HU10 pasan a Backlog Fase 2.”


## Sprint S-02 — HU11 Migración a Jest

**Periodo:** 2025-11-14

### Objetivo

Migrar el runner de pruebas de `node:test` a Jest y dejar la suite estable.

### Hecho

- Instalado Jest como devDependency.
- Agregados scripts `test`, `test:watch`, `coverage`.
- Migrados tests:
  - `filters.test.js`
  - `emailSuggester.test.js`
  - `mailService.test.js`
  - `notifications.test.js`
- ADR-003 creado y aceptado.
- `npm test` en verde.

### Riesgos

- Cobertura aún baja (pocos casos). Se recomienda una HU futura para extender cobertura y casos edge.

### Decisiones

- Jest se adopta como test runner estándar del proyecto.



## Sprint S-03 — HU5 Contrato Fastify ↔ Python classifier

**Periodo:** 2025-11-14

### Objetivo

Formalizar y probar el contrato Fastify ↔ Python (FastAPI) para clasificación avanzada de correos.

### Hecho

- Rama `feature/hu5-fastify-python-contract` creada desde `develop`.
- Alcance de HU5 definido y documentado en `PROJECT_STATE.md`.

### Pendiente

- Documentar contrato en `docs/API_REFERENCE.md` y `docs/TUTORIALS/QUICKSTART.md`.
- Agregar y/o ajustar tests de contrato en Jest.
- (Opcional) Agregar tests de contrato en Python con `fastapi.testclient`.
- Verificar flujo end-to-end con Docker compose (Fastify ↔ FastAPI ↔ DB).

### Riesgos

- Estado actual del código en `python/` aún no completamente auditado.
- Cambios futuros en el microservicio pueden romper el contrato si no se actualizan los tests.

### Día / sprint

- Estado actual: HU5 cerrada a nivel contrato/documentación; pendientes tests de contrato y flujo end-to-end.

## Sprint S-02 — HU5 Integración Python (Classifier)

- Objetivo: consolidar el contrato Fastify ↔ Python a nivel de servicio y preparar pruebas de integración.

### Hecho

- Servicio `emailSuggester.js` y tests unitarios (`tests/emailSuggester.test.js`).
- Fastify contract tests:
  - `tests/suggestionsRoutes.test.js` para `/api/v1/suggestions` con controlador mockeado.
  - `tests/notificationsRoutes.test.js` para summary/confirm/history.
  - `tests/authMiddleware.test.js` para el contrato Bearer y `request.user`.
- Suite de Jest estable: 8 test suites, 22 tests en verde (`npm test`).

### Pendiente inmediato

- Verificar flujo end-to-end (Fastify ↔ FastAPI ↔ DB) usando Docker Compose.
- (Opcional) Agregar contract tests del lado Python con `fastapi.testclient`.

### Riesgos

- FastAPI aún no está orquestado automáticamente en todos los entornos.
- Flujo OAuth Google todavía no está integrado en el ciclo e2e.

