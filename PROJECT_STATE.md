# PROJECT_STATE – Email Cleaner & Smart Notifications

> Documento de estado vivo. Solo debe contener información **comprobable** a partir de código, tests y documentación actual.

---

## 1. Contexto general

- **Repositorio:** email-cleaner-fastify
- **Backend principal:** Node.js + Fastify
- **Infra:** Docker Compose (Fastify, DB, FastAPI, n8n), Makefile, Cloud Build (según docs), MkDocs para documentación.
- **Fecha de este snapshot:** 2025-11-13 (sincronización de ramas `main` y `develop` a partir de `docs/bootstrap`).

### 1.1. Ramas

- `main`  
  - Rama estable actual.  
  - Contiene: backend Fastify completo, infra Docker, documentación MkDocs, modelos y migraciones.

- `develop`  
  - Rama de trabajo activo.  
  - Actualmente tiene **los mismos commits** que `main`.  
  - A partir de ahora, nuevas historias de usuario deben abrirse desde aquí.

- Ramas históricas (ya integradas a este estado y no usadas para trabajo futuro):  
  - `docs/bootstrap`  
  - `feature/initial-fastify-setup`

---

## 2. Estado por Historias de Usuario (HU)

> Nota: estos estados se basan en código y documentos reales que ya fueron verificados.

### HU1 – Autenticación con Gmail

- **Estado:** ✅ Implementada conceptualmente y reflejada en la arquitectura Fastify.
- **Evidencia:**
  - Integración con Google APIs en dependencias (`googleapis`, `google-auth-library`).
  - Configuración de credenciales y tokens en `.env.example` y plugins de OAuth.
- **Pendientes / Riesgos:**
  - Validar que el flujo OAuth completo en Fastify tenga tests y mocks adecuados.
  - Confirmar que no haya credenciales sensibles hardcodeadas.

### HU2 – Limpieza básica de correos

- **Estado:** ✅ Completada.
- **Evidencia:**
  - Endpoint de clasificación de correos expuesto desde Fastify (vía `/emails` o similar).
  - Persistencia en Postgres (modelos + migraciones).
  - Documentado en `docs/TUTORIALS/QUICKSTART.md` y `docs/API_REFERENCE.md`.
- **Pendientes:**
  - Ampliar cobertura de tests unitarios/integración para los filtros y la lógica de clasificación.

### HU3 – Notificaciones (acciones sugeridas sobre correos)

- **Estado:** 🟡 En curso.
- **Evidencia:**
  - Modelos `Notification` y `ActionHistory` ya existen.
  - Rutas / servicios para:
    - obtener resumen de notificaciones,
    - confirmar acciones (archivar/borrar/etc.),
    - consultar historial de acciones.
  - Integración inicial con frontend React (componentes tipo `SuggestionList` y `ConfirmButton.jsx` que llaman a `/notifications/confirm`).
- **Pendientes para marcarla como ✅ DONE:**
  - Tests unitarios e integración para:
    - `/notifications/summary`
    - `/notifications/confirm`
    - `/notifications/history`
  - Documentar estos endpoints en `docs/API_REFERENCE.md` (request/response, códigos de error).
  - Smoke test end-to-end: UI React → Fastify → DB → registro en `ActionHistory`.

### HU4 – Panel UI de usuario

- **Estado:** 🟡 Iniciada.
- **Evidencia:**
  - Existen componentes React para listar sugerencias y ejecutar acciones.
- **Pendientes:**
  - Diseñar y documentar el flujo completo de usuario:
    - filtros,
    - paginación,
    - estados de carga/errores,
    - vista de historial.
  - Tests de UI (al menos básicos) o plan de pruebas manual detallado.

### HU5 – Integración con microservicio de clasificación en Python

- **Estado:** 🟡 Iniciada.
- **Evidencia:**
  - Estructura y referencia a servicio Python (FastAPI) en `docker-compose.yml` y/o configs.
- **Pendientes:**
  - Orquestación real: Fastify llamando al microservicio Python para clasificación avanzada.
  - Endpoint/documentación que explique cuándo se usa clasificación simple vs. IA.
  - Tests de contrato entre Node (Fastify) y Python (FastAPI).

### HU6–HU10

- **Estado:** ⛔ No iniciadas.
- **Evidencia:**  
  - No se encontraron rutas, modelos ni docs claramente asociados a HU6–HU10.
  - Se mantienen como espacio para futuras funcionalidades (ej.: reglas avanzadas, n8n, etc.).

---

## 3. Componentes técnicos y estado

### 3.1. Backend Fastify

- **Status:** 🟢 Funcional y documentado.
- **Tiene:**
  - Config base (CORS, Swagger, healthcheck).
  - Plugins para DB (Sequelize / Postgres).
  - Rutas de emails, sugerencias y notificaciones.
- **Riesgos:**
  - Cobertura de tests todavía limitada.
  - Validar que todos los endpoints documentados existan y viceversa.

### 3.2. Microservicio Python (clasificador)

- **Status:** 🟡 En consolidación.
- **Tiene:**
  - Directorio `python/` con estructura de servicio.
  - Referencias en Docker / infra.
- **Riesgos:**
  - Estado del código no completamente auditado.
  - Necesario decidir si se versiona limpio, se refactoriza o se regenera.
  - Tests y contrato API a definir.

### 3.3. Frontend React

- **Status:** 🟡 En curso.
- **Tiene:**
  - Listado de sugerencias.
  - Botones de confirmación que llaman a backend (acciones sobre correos).
- **Riesgos:**
  - Aún no hay documentación unificada de los flujos UI.
  - Sin estrategia clara de pruebas (unitarias/E2E).

### 3.4. n8n / Orquestación

- **Status:** 🔵 Planeado / Esbozado.
- **Tiene:**
  - Referencias en Docker Compose.
- **Riesgos:**
  - Falta diseño detallado del uso real de n8n y su interacción con el sistema.

### 3.5. Infraestructura y CI/CD

- **Status:** 🟢 Bien encaminada.
- **Tiene:**
  - `ops/docker-compose.yml` para levantar stack local.
  - `ops/Makefile` con comandos de desarrollo (`up`, `down`, `logs`, `migrate`, etc.).
  - Pipeline de documentación (MkDocs) via GitHub Actions.
- **Riesgos:**
  - Validar que los comandos funcionan en limpio en otra máquina (reproducibilidad).

---

## 4. Riesgos y decisiones abiertas

1. **OAuth Google y manejo de credenciales**
   - Revisión de seguridad pendiente.
   - Necesario definir mock/entorno de pruebas.

2. **Estado del microservicio Python (`python/`)**
   - Debe decidirse si:
     - se integra tal cual,
     - se refactoriza,
     - o se rehace con una especificación más clara.

3. **Cobertura de tests**
   - Tests existentes son insuficientes para claims de “producción”.
   - Prioridad inmediata: HU3 (notificaciones) y contrato Fastify ↔ Python.

---

## 5. Próximo objetivo acordado

> **Objetivo actual:** Cerrar HU3 – Notificaciones

### Tareas inmediatas:

1. Crear tests para endpoints de notificaciones (summary, confirm, history).  
2. Documentar dichos endpoints en `docs/API_REFERENCE.md`.  
3. Validar flujo end-to-end:
   - Leer notificaciones → Confirmar acción → Ver action history.
4. Dejar anotada en este archivo la fecha en que HU3 cambie de 🟡 En curso a ✅ Completada.

---

