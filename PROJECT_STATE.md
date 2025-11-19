# PROJECT_STATE – Email Cleaner & Smart Notifications  
> Última actualización automática por ChatGPT (HU12 corregida)

## 📌 Estado general del proyecto

El proyecto está alineado en tres capas principales:

1. **Fastify Backend (Node.js)**
2. **Microservicio de ML (FastAPI / Python)**
3. **Frontend React**

La integración entre Fastify ↔ ML ya está establecida y probada.

El frontend ya puede consumir `/api/v1/suggestions`, pero HU6 (UI real de Sugerencias) sigue pendiente.

---

## 🧠 Estado de Historias de Usuario (Scrum / Roadmap)

### ✔ HU12 — Integración ML (Fastify ↔ Python) — **DONE**

Esta HU fue corregida y reescrita para alinear el diseño con rutas reales del sistema:

- `/api/v1/mails` → listado base SIN IA  
- `/api/v1/suggestions` → listado enriquecido CON IA  

**Cumple:**

- Integración `Fastify → emailSuggester → mlClient → FastAPI`.
- Timeout configurable `ML_TIMEOUT_MS`.
- URL configurable `ML_BASE_URL`.
- Normalización robusta de sugerencias (JSON, strings, números, objetos).
- Fallback seguro cuando el ML falla.
- Logs con contexto sin exponer tokens.
- Tests en verde:
  - `mlClient.test.js`
  - `emailSuggester.test.js`
  - `suggestionsRoutes.test.js`
  - `mailsRoutes.test.js` (antes `emailsRoutes.test.js`)
- Documentación corregida:
  - API_REFERENCE.md
  - QUICKSTART.md
  - README_REENTRY.md  
  - Sprint_Log.md  

**Nota:**  
Se eliminó `/api/v1/emails` de la documentación porque nunca existió en el backend real.

---

### 🔧 HU6 — UI React: Sugerencias Inteligentes — **En progreso**

- React ya consume backend base.
- No existe aún una vista formal para suggestions.
- Pendiente: HU específica para UI + interacción con acciones (“marcar como leído”, “archivar”, etc.)

---

## 🚦 Infraestructura Local (Docker / Dev Envs)

- Fastify corre localmente en puerto `3000`
- ML corre en `8000`
- Docker-compose funcional, pero no integrado al 100% con Gmail OAuth (pending)
- Variables reproducibles vía `.env.example`

---

## 🔑 Variables importantes del sistema (resumen)

```env
ML_BASE_URL=http://localhost:8000
ML_TIMEOUT_MS=5000
FASTAPI_URL=http://fastapi:8000

