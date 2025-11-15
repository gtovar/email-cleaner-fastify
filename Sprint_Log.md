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

