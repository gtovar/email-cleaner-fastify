# Workflow de Desarrollo (versión adaptada)

Este proyecto utiliza un flujo de trabajo basado en:

* GitHub Flow
* Scrum adaptado a desarrollador individual
* Continuous Re-entry Workflow

## Ciclo de trabajo

1. Reentrada (abrir `README_REENTRY.md`)
2. Revisar estado (`PROJECT_STATE.md`)
3. Crear/abrir issues según HU activa
4. `make up` para levantar servicios
5. Desarrollar + pruebas + documentación
6. Crear Pull Request con checklist DoR/DoD
7. CI: lint + test + build
8. Merge → actualizar Sprint_Log.md y PROJECT_STATE.md

- Working branch: `develop`
- Branch naming: `type/huNN-short-desc` (ejemplo: `feat/hu17-unify-suggestions-summary`)
- Flow: branch desde `develop` → PR/merge de regreso a `develop`; `main` se actualiza solo desde `develop` en releases/checkpoints

## Escalabilidad

Este workflow permite incorporar más desarrolladores sin cambios estructurales:
issues, PRs, ADRs y documentación ya están preparados para colaboración incremental.

## Audit Policy (Canonical)

- Default mode: NORMAL (warnings do not block work).
- Strict mode: run only before
  - merging into canonical branches (e.g., develop/main), or
  - starting a large feature (contract/db/cross-cutting changes).

Definition of “large feature”:
- modifies API/event contracts
- touches DB/models/migrations
- includes mass renames/deletes (R/D)
- cross-layer refactors (routes/controllers/services/events/tests)
- introduces new external integration
