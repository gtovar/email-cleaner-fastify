## Documentation Language & Style Policy (Canonical)

### Scope (What this applies to)
This policy applies to **canonical documentation**:
- `README.md`, `SUMMARY.md`
- `docs/index.md`
- `docs/architecture.md`, `docs/DESIGN_DOCUMENT.md`, `docs/API_REFERENCE.md`
- `docs/events_contract.md`, `docs/workflow.md`
- `docs/adr/*.md`

Non-canonical content (learning notes, scratchpads) must live under a clearly labeled area (e.g., `docs/notes/`) and must not override canonical docs.

### Language
- Canonical documentation MUST be written in **English**.
- Exceptions: proper names of external docs (e.g., `Scrum.docx`) and unavoidable product names.

### Tone (No speculation)
- Tone MUST be **formal, neutral, factual**. (No hype, no “probably”.)
- Allowed verbs: “Exists…”, “Was validated…”, “Includes…”
- Not allowed: “Will probably…”, “Should have…”, “We plan to…”

### Naming (Exact coordinates)
Always use full exact identifiers:
- Files: `src/services/emailSuggesterService.js`
- Endpoints: `/api/v1/notifications/events`
- Env vars: `ML_BASE_URL`
- Tests: `tests/notificationsRoutes.test.js`

### Formatting
- Bullet points MUST use `-`
- Code blocks MUST use triple backticks and specify language when applicable
- Keep sections visually readable (single blank line between major sections)
- Emojis only for non-technical status labels (avoid in code/endpoints/paths)

### Index rule (No ghost docs)
Any new canonical doc MUST be referenced in:
- `docs/index.md` (primary) and, when relevant, `SUMMARY.md`.

### “Before merging docs” checklist
- [ ] Canon docs are in English
- [ ] No speculation words (“probably”, “should”, “maybe”)
- [ ] Paths/endpoints are exact
- [ ] `docs/index.md` updated if a new doc exists
- [ ] Doc Health checks pass (fences, canonical links)


# Decision Maker para crear doc nuevo vs actualizar existente

La regla principal (default):

> **Actualizar un doc existente**.
> **Crear doc nuevo solo si pasa un set de gates**.

### Gate 0 — Evidence Gate (obligatorio)

**Pregunta:** ¿Tengo evidencia primaria para lo que voy a documentar?
Evidencia primaria = (diff, código, tests, snapshot, commit).

* Si **NO**: no se crea doc canónico. Se registra como **“Open Question”** en `SPRINT_LOG.md` o como nota temporal.
* Si **SÍ**: continúa.

### Gate 1 — “Owner Doc” Gate (single source of truth)

**Pregunta:** ¿Existe ya un documento cuyo propósito cubre este contenido?
Mapa de ownership (regla de asignación):

* **Contrato HTTP** → `docs/API_REFERENCE.md`
* **Contrato de eventos** → `docs/events_contract.md`
* **Decisión arquitectónica con tradeoffs** → `docs/adr/XXX-*.md`
* **Arquitectura/flows** → `docs/architecture.md` + `docs/DESIGN_DOCUMENT.md`
* **Proceso / reentrada** → `README_REENTRY.md` + `docs/workflow.md`
* **Historia / evolución** → `SPRINT_LOG.md`
* **Estado factual** → `PROJECT_STATE.md`

Si existe owner doc: **actualiza ahí**.
Crear doc nuevo en este punto solo se permite si Gate 2 lo justifica (split).

### Gate 2 — Split Gate (cuándo NO cabe en el doc owner)

Crear doc nuevo (o separar) está permitido si se cumple **al menos 1** condición fuerte:

**C2.1 — Audiencia distinta**

* El contenido es para una audiencia distinta (ej. operador vs contribuidor vs usuario final) y mezclarlo degrada claridad.

**C2.2 — Cambio de naturaleza**

* El doc owner es referencia pura (ej. API_REFERENCE) y estás intentando meter tutorial/razonamiento: eso debe ir a `TUTORIALS/` o `DESIGN_DOCUMENT`.

**C2.3 — Tamaño/Complejidad**

* La sección nueva sería > ~20–30% del doc actual **o** introduce un “sub-sistema” completo (ej. EventBus + listeners + EventStore + idempotencia) que se consulta recurrentemente.

**C2.4 — Reuso recurrente**

* La misma duda/tema aparece ≥2 veces y su ausencia genera drift (coste alto de olvido).

**C2.5 — Estabilidad**

* El contenido tiene probabilidad alta de mantenerse ≥1 sprint (no es algo “en transición hoy”).

Si ninguna se cumple: **no hay doc nuevo**; se añade al owner doc o al Sprint_Log como provisional.

### Gate 3 — Anti-duplication Gate (obligatorio)

Si se crea doc nuevo:

* Debe declarar su **Scope** y su **Owner**.
* Debe incluir una línea de “Single Source of Truth”:
  “Este doc es la fuente de verdad para X; otros docs solo linkean.”
* Debe actualizar `docs/index.md` para añadir el enlace (si aplica).
* Debe evitar copiar contenido que “ya vive” en otro doc (regla del protocolo de PROJECT_STATE extrapolada a todo el set).

---

## Resultado: plantilla de decisión (lo que se registra cada vez)

Esto es lo mínimo que debe salir cada vez que discutamos “¿doc nuevo?”:

**Doc Decision Record (DDR)** (no necesariamente un archivo; puede ser un bloque en Sprint_Log si no amerita ADR)

* Topic:
* Evidence:
* Candidate Owner Doc:
* Gates passed:

  * G0 Evidence: yes/no
  * G1 Owner exists: yes/no
  * G2 Split reason: (C2.x)
  * G3 Anti-duplication plan: yes/no
* Decision:

  * Update existing: (file + section)
  * Create new: (file path + why)
  * Defer: (Sprint_Log “Open Question”)

---

# Scoring (opcional) para que sea todavía más mecánico

Si quieres reducir subjetividad, usa un score 0–10:

* Evidence strength (0–2)
* Owner fit gap (0–2) (0 = cabe perfecto; 2 = no cabe)
* Audience separation (0–2)
* Reuse frequency (0–2)
* Stability horizon (0–2)

**Regla:**

* Score ≤ 4 → Update existing doc
* Score 5–6 → Update existing + link + Sprint_Log note (si hay transición)
* Score ≥ 7 → Create new doc (o split), con G3 anti-duplication

---

## Aplicación rápida a tu caso típico (DL-01 Domain Events)

* Evidence: sí (código + tests + diff) → G0 pasa.
* Owner doc existe: `docs/events_contract.md` → G1: update ahí.
* ¿Split? normalmente no (a menos que metas tutorial/arquitectura profunda) → G2 no.
* ¿ADR? solo si la decisión “domain.* vs NEW_*” se declara canónica y estable → eso sí sería ADR (tradeoff + dirección).

**Decisión mecánica:**
Actualizar `docs/events_contract.md`.
Crear ADR solo si decidimos oficialmente naming canónico.



## Language & Tone (Canonical)

- Canonical documentation is written in **English**.
- Spanish is allowed only for clearly marked **Notes** (non-canonical) or in logs like `Sprint_Log.md`.
- Canonical docs must be **factual**:
  - Put guesses under a dedicated `## Hypotheses` section.
  - Avoid hedging in canonical sections (e.g., “maybe/probably/I think/we think”).

