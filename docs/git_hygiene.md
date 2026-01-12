# Git Hygiene & Working Tree Protocol
> **Key point:** We do not aim for a “perfectly clean working tree”. We aim for a working tree that is **readable, classified, and checkpointed with intent**.

**Type (Diátaxis):** Guide / How‑to (process) + Light reference (glossary)  
**Status:** Canonical (project-wide)  
**Audience:** Dev (today), Dev-in-3-weeks (re-entry), reviewer / interview reader  
**Last updated:** 2026-01-06  
**Related:** `docs/workflow.md`, `docs/documentation_rules.md`, `README_REENTRY.md`, `PROJECT_STATE.md`, `docs/events_contract.md`

---

## Purpose
Define a project protocol to maintain **traceability**, **scope control**, and **fast re-entry** using Git’s three layers:

- **Working Tree (Desk):** files as they exist on disk right now.
- **Staging/Index (Tray):** changes selected for the next coherent checkpoint.
- **HEAD/History (Canon):** the official history (commits).

This protocol optimizes for **clarity**, not perfection.

---

## Scope and non-goals
### In scope
- Interpreting repo state (desk/tray/canon).
- Preventing *scope drift* (mixing unrelated changes).
- Avoiding “ghost docs” (docs that exist but cannot be found).
- Defining rules for **product vs artifacts vs experiments**.

### Out of scope
- Full branching strategy (see `docs/workflow.md`).
- Forcing “fast commits” or checkbox-driven commits.
- Replacing ADRs when architectural decisions are involved.

---

## When to consult this document
- Before starting a new feature (Ready-for-next-feature gate).
- When `git status` feels overwhelming.
- When you see many `??` files and it is unclear whether they are product or outputs.
- During re-entry after days/weeks away.

---

## Core model (Desk / Tray / Canon)

### 1) Desk (Working Tree)
Where changes live while you are actively working.
- The desk can be messy, but it must remain **interpretable**.
- Primary failure mode: mixing docs + refactor + feature in one unstructured pile.

### 2) Tray (Staging / Index)
A “pre-declaration”: **this** is the next coherent checkpoint.
- Without the tray, you get the anti-pattern: *“everything ended up in the commit by accident.”*

### 3) Canon (HEAD / History)
Committed history is the official, auditable truth.
- Canonical docs and contracts must be explainable from the commit history.

---

## Reading `git status` (semantic meaning)
- **Modified (M):** changed tracked file.
- **Deleted (D):** removed tracked file (often a strong decision).
- **Renamed (R):** name change; preserve traceability.
- **Untracked (??):** new file not yet part of canon.

**Rule of thumb:** `??` is not “bad”. It is **unclassified**. Unclassified things get forgotten.

---

## Mandatory classification (anti-chaos)
Every new file/change must be classified:

### A) Product (must live in the repo)
- Source code in `src/**`
- Tests in `tests/**`
- Canonical docs in `docs/**`
- ADRs and decision records

**Risk signal:** product under `??` is usually **WARN** until explicitly accepted as canon.

### B) Artifact (should NOT live in the repo by default)
- Generated logs
- Temporary outputs (exports, diffs, reports)
- Bundles (`*.tgz`) or dumps

These belong in a dedicated “corral” (e.g., `logs/` or `artifacts/`) or should be ignored.

### C) Experiment (spike)
- Quick prototypes or exploratory changes
- Must have an explicit “expiry”: decide Product vs discard

---

## Artifact policy (do not turn the repo into Downloads)
1) All artifacts must either:
   - live in an artifact corral (`logs/` or `artifacts/`), **or**
   - be explicitly ignored.
2) Versioned artifacts are the exception and require a declaration:
   - Why do we version this artifact?
   - How do we regenerate it?
   - What is its value?

---

## Ready for next feature (minimum gate)
Before starting a new feature:

1) Quality gate passes (tests + audit).
2) Canonical docs are indexed (if it is not in the index, it effectively does not exist).
3) No “product untracked” without an explicit decision (canon vs experiment).
4) A minimal narrative exists: what was done, what remains, why.

---

## Common anti-patterns this protocol prevents
- **Ghost doc:** a doc exists but is not indexed, so it disappears during re-entry.
- **Scope drift:** refactor + feature + doc fixes mixed into one pile.
- **Artifact pollution:** generated outputs show up as `??` and confuse the real state.
- **Slow re-entry:** returning to the repo and not knowing what matters.

---

## Tooling integration: Working Tree Report (spec)
The project auditor should print a “Working Tree Report” block with:

- **Tray (staged):** selected files for next checkpoint.
- **Desk (unstaged):** changed files not selected.
- **Untracked:** new files.
- **Suggested classification:**
  - Artifact candidates (outputs/logs/bundles)
  - Product candidates (code/docs/tests)

### Suggested severity
- **FAIL**
  - Canonical docs missing index references (ghost doc risk).
  - Doc Health failures (broken fences, missing canonical links).
- **WARN**
  - Product untracked (may be intentional; still risky).
  - Artifacts outside the corral.
- **INFO**
  - Desk changes that match the current scope.

---

## Editorial policy (canonical docs)
This document is canonical and therefore follows the project documentation policy:

- **Language:** English
- **Tone:** formal, neutral, factual (no speculation words like “probably”, “maybe”)
- **Exact coordinates:** full paths, endpoint strings, env var names

(See `docs/documentation_rules.md` for the authoritative rule set.)

---

## Mini glossary (for interviews)
- **Working tree:** actual disk state today.
- **Staging/index:** selected set for the next checkpoint.
- **HEAD:** current commit (official truth).
- **Scope drift:** mixing unrelated changes in one change-set.
