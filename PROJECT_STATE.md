# PROJECT_STATE.md

## 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications — Fastify Backend
REPO_PATH: /Users/gil/Documents/email-cleaner/email-cleaner-fastify
BRANCH: eat-experimental-CQRS
HEAD_COMMIT: fbb11b8 (Experimental apply CQRS)
BASELINE_REFERENCE: develop @ 097398a (feat(events): implement notification event pipeline (HU16))

SNAPSHOT_DATE: 2025-12-31 01:37 CST (America/Monterrey)  (from prior checkpoint; NOT VERIFIED in this message)
AUTHOR: Gilberto / ChatGPT

WORKING_TREE_STATUS: Uncommitted changes present (from prior checkpoint; NOT VERIFIED in this message)

LAST_VERIFIED_TESTS_DATE: 2026-01-XX (America/Monterrey) (timestamp NOT captured in this file; evidence pasted in chat)
LAST_VERIFIED_DOCS_ENDPOINTS_DATE: 2026-01-XX (America/Monterrey) (timestamp NOT captured in this file; evidence pasted in chat)

SNAPSHOT_METHOD (Evidence Sources):
- proyecto_completo_email-cleaner-fastify_january_03_of_2026.txt (repository export; previously provided)
- cambios-enero-03.txt (git diff output; previously provided)
- rg outputs (pasted in chat; PRIMARY for Docs Alignment gate)
- npm test output (pasted in chat; PRIMARY for test status in this checkpoint)

SCOPE:
- This checkpoint covers the Fastify backend only.
- React frontend and Python ML service are referenced only when the backend contract likely impacts them.

---

## 2. Executive Summary

- The backend is in an active transition to CQRS-lite + internal EventBus with a centralized DOMAIN_EVENTS catalog.
- Docs Alignment for canonical event naming is PASS (see Section 8: Docs Alignment: PASS — 2026-01-03).
- npm test overall status is VERIFIED PASS in this checkpoint:
  - Test Suites: 12 passed, 12 total
  - Tests: 40 passed, 40 total
  - Evidence: terminal output pasted in chat; exact timestamp NOT captured in this file.
- Docs endpoint legacy check is VERIFIED PASS in this checkpoint:
  - rg -n "/api/v1/mails" docs -> 0 matches
  - Evidence: rg output pasted in chat; exact timestamp NOT captured in this file.

---

## 3. Component-by-Component Technical State

### 3.1 Fastify Backend — HTTP Surface (Observed)

Known notifications routes impacted by the refactor (exact prefix depends on route registration in src/index.js):

- POST /api/v1/notifications/confirm
  Request body:
    {
      "emailIds": ["<string>", "..."],
      "action": "accept" | "reject"
    }

- GET /api/v1/notifications/history
  Purpose: query action history (auditing).

- GET /api/v1/notifications/events
  Purpose: query stored NotificationEvents (EventStore-like feed).

IMPORTANT:
- Do NOT assume the public path without checking Fastify route registration (prefixing).
- docs/API_REFERENCE.md is the canonical place to document the final contract.

### Working Rule (temporary)
When HU docs, API_REFERENCE, and code disagree, STOP and verify against code paths that persist data (commands/listeners).
This project is in active refactor; HU documents may contain outdated examples.

---

### 3.2 Fastify Backend — CQRS-lite Shape (Observed)

Current architectural direction (evidence: file moves/deletions + new commands/builders observed in prior snapshots/diffs; NOT VERIFIED in this message):

- Controllers focus on HTTP concerns and delegate to:
  - Commands (write side)
  - Queries (read side)
- Event creation/persistence is routed through commands (e.g., recordNotificationEventCommand).
- EventBus is treated as an internal integration seam:
  - DOMAIN_EVENTS catalog is used to normalize event names/payloads.

---

### 3.3 Fastify Backend — Event Pipeline / NotificationEvents (Observed)

Event pipeline exists and is being normalized around canonical event strings (see Section 8).

---

### 3.4 PostgreSQL / Sequelize Models (Observed)

IMPORTANT:
- This checkpoint does not claim migrations are correct or runnable; verify by running tests and booting the app.

---

### 3.5 ML Microservice Integration (Observed Impact)

Status:
- Integration contract is NOT verified in this checkpoint (needs runtime evidence).

---

### 3.6 React Frontend (Out of Scope, Risk Noted)

- Not evaluated here.
- High risk of breaking UI if it depended on old notification endpoints or request schema.

---

## 4. User Story Status (Evidence-Based, Minimal)

This checkpoint is branch-specific.
It does NOT redefine DONE globally without runtime evidence.

- HU16 (Notification Event Pipeline) — Implemented in develop (commit 097398a), branch has experimental refactor on top.
- HU5 (ML schema alignment) — Present in history (commit(s) referenced in prior notes; NOT VERIFIED here).
- CQRS-lite experiment — Present in branch head (fbb11b8) and ongoing.

---

## 5. Evidence (Primary)

### 5.1 Docs Alignment Evidence (PRIMARY — from pasted rg output)
- Legacy checks:
  - rg -n "NEW_SUGGESTIONS\b" src tests || echo "OK: 0 matches for NEW_SUGGESTIONS"
    -> OK: 0 matches for NEW_SUGGESTIONS
  - rg -n "DOMAIN_EVENTS\.SUGGESTION_GENERATED" src tests || echo "OK: 0 matches for DOMAIN_EVENTS.SUGGESTION_GENERATED"
    -> OK: 0 matches for DOMAIN_EVENTS.SUGGESTION_GENERATED

- Canon markers:
  - docs/events_contract.md contains API Filtering Rule (Option A)
  - docs/API_REFERENCE.md contains Canonical rule:

- Canon propagation:
  - domain.suggestions.generated present in docs/src/tests
  - DOMAIN_EVENTS.SUGGESTIONS_GENERATED present in docs/src/tests

### 5.2 Other Evidence (Secondary — referenced previously)
- proyecto_completo_email-cleaner-fastify_january_03_of_2026.txt
- cambios-enero-03.txt

### 5.3 Runtime/Test Evidence (PRIMARY — from pasted terminal output)
- npm test:
  - Test Suites: 12 passed, 12 total
  - Tests: 40 passed, 40 total

### 5.4 Docs Endpoint Alignment Evidence (PRIMARY — from pasted rg output)
- rg -n "/api/v1/mails" docs -> 0 matches
- Decision: /api/v1/emails is the documented contract in docs/** (no legacy endpoint references remain).

---

## 6. Risks (Current, Not Future Plans)

- API compatibility risk:
  - Endpoint paths and/or schema changes can break consumers (React, scripts, n8n).
- State drift risk:
  - Because working tree may be uncommitted, snapshots can diverge quickly.
- ML integration uncertainty:
  - ML “orchestrator” layer stability must be validated by tests/runtime.

---

## 7. Next Immediate Action (Verification Only)

1) DONE — Re-run npm test to refresh the true PASS/FAIL state after the Docs Alignment changes.
   - Result: PASS (12/12 suites; 40/40 tests).

2) Verify notification routes in the test fixture if 404s persist:
   - Add temporary app.printRoutes() in the relevant test bootstrap (then remove).

3) Freeze evidence:
   - Create a commit (or snapshot) that includes the docs alignment changes so the checkpoint remains stable.
   - NOTE: requires git status -sb evidence (NOT VERIFIED in this message).

---

## 8. Docs Alignment: PASS — Canon domain.suggestions.generated (2026-01-03)

### HECHO (evidencia: rg)
- Legacy eliminado de src/** y tests/**:
  - rg -n "NEW_SUGGESTIONS\b" src tests || echo "OK: 0 matches for NEW_SUGGESTIONS"
    - Resultado: OK: 0 matches for NEW_SUGGESTIONS
  - rg -n "DOMAIN_EVENTS\.SUGGESTION_GENERATED" src tests || echo "OK: 0 matches for DOMAIN_EVENTS.SUGGESTION_GENERATED"
    - Resultado: OK: 0 matches for DOMAIN_EVENTS.SUGGESTION_GENERATED

- Marcadores documentales presentes:
  - docs/events_contract.md incluye API Filtering Rule (Option A)
  - docs/API_REFERENCE.md incluye Canonical rule:

- Canon propagado en docs/src/tests:
  - domain.suggestions.generated
  - DOMAIN_EVENTS.SUGGESTIONS_GENERATED

### DECISIÓN (Option A)
El parámetro type en /api/v1/notifications/events filtra por canonical domain event type string (ej. domain.suggestions.generated). Legacy (NEW_SUGGESTIONS*) solo puede existir en docs bajo DEPRECATED.

### CHECKLIST (reproducible)
```bash
rg -n "NEW_SUGGESTIONS\b" src tests || echo "OK: 0 matches for NEW_SUGGESTIONS"
rg -n "DOMAIN_EVENTS\.SUGGESTION_GENERATED" src tests || echo "OK: 0 matches for DOMAIN_EVENTS.SUGGESTION_GENERATED"
rg -n "Canonical rule:|API Filtering Rule \(Option A\)" docs/API_REFERENCE.md docs/events_contract.md
rg -n "domain\.suggestions\.generated" docs src tests
rg -n "DOMAIN_EVENTS\.SUGGESTIONS_GENERATED" docs src tests
```

## 9. Version Log

* 2025-12-31 — Prior checkpoint built from snapshot/diff (historical; see Appendix if needed).
* 2026-01-03 — Docs Alignment gate closed: PASS (Option A) based on rg evidence.
* 2026-01-XX — Tests VERIFIED PASS: npm test -> 12/12 suites; 40/40 tests. Docs endpoints aligned: rg -n "/api/v1/mails" docs -> 0 matches. (Exact timestamp NOT captured in file; evidence pasted in chat.)

