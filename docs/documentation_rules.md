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
- Files: `src/services/suggestionService.js`
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


# Decision maker: create a new doc vs update an existing one

Default rule:

> **Update an existing document.**
> **Create a new document only if it passes the gates below.**

### Gate 0 — Evidence gate (mandatory)

**Question:** Do we have primary evidence for what we are documenting?
Primary evidence = diff, code, tests, snapshot, commit.

* If **NO**: do not create a canonical doc. Record it as an **Open Question** in `SPRINT_LOG.md` or as a temporary note.
* If **YES**: continue.

### Gate 1 — Owner doc gate (single source of truth)

**Question:** Does a document already exist whose scope covers this content?
Ownership map:

* **HTTP contract** -> `docs/API_REFERENCE.md`
* **Event contract** -> `docs/events_contract.md`
* **Architectural decision with tradeoffs** -> `docs/adr/XXX-*.md`
* **Architecture/flows** -> `docs/architecture.md` + `docs/DESIGN_DOCUMENT.md`
* **Process / re-entry** -> `README_REENTRY.md` + `docs/workflow.md`
* **History / evolution** -> `SPRINT_LOG.md`
* **Factual state** -> `PROJECT_STATE.md`

If an owner doc exists: **update it**.
Creating a new doc at this point is only allowed if Gate 2 justifies a split.

### Gate 2 — Split gate (when it does not fit the owner doc)

Creating a new doc (or splitting) is allowed if **at least one** condition holds:

**C2.1 — Different audience**

* The content is for a different audience (e.g., operator vs contributor vs end user) and mixing it reduces clarity.

**C2.2 — Different nature**

* The owner doc is reference-only (e.g., API_REFERENCE) and you are trying to add tutorial or reasoning; that belongs in `TUTORIALS/` or `DESIGN_DOCUMENT`.

**C2.3 — Size/complexity**

* The new section would be > ~20–30% of the current doc **or** it introduces a complete subsystem (e.g., EventBus + listeners + EventStore + idempotency) that must be referenced repeatedly.

**C2.4 — Reuse**

* The same question appears >= 2 times and the absence of a doc causes drift (high cost of forgetting).

**C2.5 — Stability**

* The content is likely to remain stable for >= 1 sprint (not in flux today).

If none apply: **no new doc**; add it to the owner doc or to Sprint_Log as provisional.

### Gate 3 — Anti-duplication gate (mandatory)

If a new doc is created:

* It must declare its **Scope** and **Owner**.
* It must include a “Single Source of Truth” line:
  “This doc is the source of truth for X; other docs only link to it.”
* It must update `docs/index.md` to add the link (if applicable).
* It must avoid copying content that already lives elsewhere (PROJECT_STATE anti-duplication principle).

---

## Decision record template (required output)

This is the minimum output every time we discuss “new doc?”:

**Doc Decision Record (DDR)** (not necessarily a file; can live in Sprint_Log if no ADR is needed)

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

# Scoring (optional) to reduce subjectivity

Use a 0–10 score:

* Evidence strength (0–2)
* Owner fit gap (0–2) (0 = perfect fit; 2 = does not fit)
* Audience separation (0–2)
* Reuse frequency (0–2)
* Stability horizon (0–2)

Rule:

* Score <= 4 -> Update existing doc
* Score 5–6 -> Update existing + link + Sprint_Log note (if in transition)
* Score >= 7 -> Create new doc (or split), with G3 anti-duplication

---

## Quick application to the typical case (DL-01 Domain Events)

* Evidence: yes (code + tests + diff) -> G0 passes.
* Owner doc exists: `docs/events_contract.md` -> G1: update there.
* Split? usually no (unless adding tutorial/architecture depth) -> G2 no.
* ADR? only if the decision “domain.* vs NEW_*” is declared canonical and stable -> then it is an ADR (tradeoff + direction).

Mechanical decision:
Update `docs/events_contract.md`.
Create an ADR only if we officially decide canonical naming.

---

## Language & Tone (Canonical)

- Canonical documentation is written in **English**.
- Spanish is allowed only for clearly marked **Notes** (non-canonical) or in logs like `Sprint_Log.md`.
- Canonical docs must be **factual**:
  - Put guesses under a dedicated `## Hypotheses` section.
  - Avoid hedging in canonical sections (e.g., “maybe/probably/I think/we think”).
