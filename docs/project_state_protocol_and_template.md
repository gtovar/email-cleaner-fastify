# PROJECT_STATE Protocol and Template

This document defines the canonical template and update rules for `PROJECT_STATE.md` (Fastify backend).

---

# 1) Template (Snapshot Metadata)

```
PROJECT_NAME: Email Cleaner & Smart Notifications
SNAPSHOT_DATE: <YYYY-MM-DD HH:MM CST>
COMMIT: <short-hash | pending>
ENVIRONMENT: <local | develop | main | feature/...>
```

Rules:
- `SNAPSHOT_DATE` must be the real update time.
- `COMMIT` must reference the commit that matches the snapshot; use `pending` if not committed yet.
- This file is a **complete snapshot**, not a changelog.

---

# 2) Update Rules (Backend)

Update `PROJECT_STATE.md` only when one of these is true:
- A user story changes status.
- Routes, services, contracts, or infrastructure change.
- A critical test changes pass/fail status.
- A new technical component is added.

Never update it for plans, ideas, or speculative notes.

---

# 3) Required Sections

## Executive Summary
- 5–7 factual lines, no opinions or plans.

## Component-by-Component State
- Backend, ML service, frontend (as dependencies), DB, n8n.
- Only facts verified in code/tests.

## User Story Status
Use this exact format:

```
### HUXX — <name>

**Status:** DONE | IN_PROGRESS | BLOCKED | BACKLOG

**Evidence:**
- <files, routes, tests>

**Open items:**
- <missing technical items only>

**Risks:**
- <objective risks only>

**Recent change:**
- <1–2 lines, optional commit>
```

## Next Immediate Action
- One single, real technical step (5–15 minutes).

---

# 4) Prohibited Content

Do not include:
- plans or backlog items
- long discussions or narratives
- code snippets or logs
- speculative risks
- process definitions (Scrum details)

---

# 5) Language and Tone

- English only.
- Formal, factual, neutral tone.
- No "maybe", "probably", "should".
- Use exact identifiers (paths, endpoints, env vars).

---

# 6) Version Log

End the file with a short version log:

```
## Version log
- YYYY-MM-DD HH:MM CST — <change> (commit: <hash | pending>)
```
