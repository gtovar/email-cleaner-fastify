# PROJECT_STATE Fill Guide

This document defines how `PROJECT_STATE.md` must be filled in this repository.

This repo uses the shared workspace `PROJECT_STATE` contract.
The structure and required labels below must remain identical across repos.

---

## 1. Core Contract

Every `PROJECT_STATE.md` must include this top-level shape:

```md
# PROJECT_STATE.md — <Repo Name>

Last updated: <YYYY-MM-DD HH:MM CST> — Commit: <hash | pending>

---

## 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: <exact project name>
SNAPSHOT_DATE: <YYYY-MM-DD HH:MM CST>
COMMIT: <hash | pending>
ENVIRONMENT: <local | develop | main | feature/...>
REPO_PATH: <absolute repo path>
BRANCH: <branch name>
WORKING_TREE_STATUS: <Clean | Dirty (modified files present)>
TEST_STATUS: <PASS | FAIL | Not run>

## 2. Executive Summary

## 3. Component-by-Component Technical State

## 4. User Story Status (Evidence-Driven)

### HUXX — <name>

**Status:** DONE | IN_PROGRESS | BLOCKED | BACKLOG
**Evidence:**
- <files, routes, tests>
**Open items:**
- <missing technical items only>
**Technical risks:**
- <objective risks only>
**Recent change:**
- <1–2 factual lines, optional commit>

## 5. Current Technical Risks

## 6. Next Immediate Action

➡️ <one single technical step>

## Version log
```

Required rules:
- English only
- factual and neutral tone
- exact identifiers for files, endpoints, env vars, and tests
- one single next immediate action
- no plans, backlog, or speculative notes

---

## 2. Repo-Specific Expectations

For the Fastify backend, Section 3 should usually cover:
- route registration and API surface
- auth/session behavior
- commands, events, and event bus
- persistence and migrations
- external integrations such as ML, Gmail, and n8n

Section 4 should track backend-facing HUs using the shared status block exactly.

---

## 3. Relationship to Other Docs

- `PROJECT_STATE.md` is the factual snapshot
- `README_REENTRY.md` is the operational restart document
- `Sprint_Log.md` is the factual event history

Do not duplicate long factual state from `PROJECT_STATE.md` into `README_REENTRY.md`.
