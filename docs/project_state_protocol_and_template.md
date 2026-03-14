# PROJECT_STATE Protocol and Template

This document is the Fastify-specific extension for `PROJECT_STATE.md`.

The shared structure and required labels now live in:
- `email-cleaner-fastify/docs/project_state_fill_guide.md`

Use that fill guide as the primary contract.
Use this file only for backend-specific expectations.

---

## Backend-Specific Expectations

Section 3 should usually cover:
- route registration and API surface
- auth/session behavior
- commands, events, and event bus
- persistence and migrations
- external integrations such as ML, Gmail, and n8n

Section 4 should track backend-facing HUs with the shared status block exactly.

---

## Update Triggers

Update `PROJECT_STATE.md` when one of these is true:
- a backend user story changes status
- routes, services, contracts, or infrastructure change
- a critical test changes pass/fail status
- a new backend technical component is added

Never update it for plans, ideas, or speculative notes.
