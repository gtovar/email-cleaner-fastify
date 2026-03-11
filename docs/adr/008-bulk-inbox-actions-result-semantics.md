# ADR 008: Bulk Inbox Actions Result Semantics

- Status: accepted
- Date: 2026-03-10

## Context

HU19 keeps Inbox direct and bulk actions under the same feature boundary.
The row-level slice is already implemented and locally validated end-to-end for `archive`, `delete`, and `mark_unread`.

Bulk actions introduce semantic decisions that are not covered by ADR 003 (frontend interaction rules) or ADR 007 (dedicated Inbox-actions contract):

- whether bulk execution is atomic or allows partial success
- how the backend reports per-item outcomes
- how the frontend distinguishes system failure from valid execution with item-level failures
- whether the Inbox view refreshes from the server or reconciles local state after a bulk action

Those rules must be frozen before implementing the bulk slice so backend, frontend, tests, and E2E flows use the same result semantics.

## Decision

Bulk Inbox actions will use **partial success semantics** with **per-item results**.

### Result model

- A bulk request is processed item by item.
- A bulk request is considered `success: true` when the request executed correctly at the system level, even if some or all items failed individually.
- Item-level failures must be reported in the response body and must not be collapsed into a global request failure.
- A bulk request is considered `success: false` only when the request fails before valid item processing begins, for example auth failure, validation failure, or systemic execution error.

### Response shape

Bulk responses must include:

```json
{
  "success": true,
  "execution": "partial",
  "action": "archive",
  "source": "inbox",
  "summary": {
    "total": 8,
    "processed": 6,
    "failed": 2
  },
  "results": [
    { "emailId": "e1", "status": "ok" },
    { "emailId": "e2", "status": "ok" },
    { "emailId": "e3", "status": "error", "reason": "not_found" }
  ]
}
```

Response rules:

- `success` represents request-level execution, not “all items succeeded”.
- `execution` must be one of:
  - `"full"` -> all items processed successfully
  - `"partial"` -> mix of successes and failures
  - `"none"` -> request executed correctly but no items processed successfully
- The `execution` value must be consistent with the `summary` counters.
- `summary.total` equals the number of requested email IDs.
- `summary.processed` equals the number of items with `status: ok`.
- `summary.failed` equals the number of items with `status: error`.
- `results` must preserve item-level status for every requested email ID.

### Frontend reconciliation rule

- The first bulk implementation will use **local reconciliation** after a successful response.
- Current selection must be cleared after the action completes.
- Bulk controls remain disabled until a new selection exists.
- A later optimization may introduce full refresh or hybrid refresh logic, but that is outside this ADR.

### UX feedback rule

- Partial success must be communicated with aggregate feedback, for example:
  - `6 emails archived · 2 could not be processed`
- A response with `execution: none` must use normal error feedback semantics even when `success: true`.
- Partial success must not trigger a global blocking error modal.

## Consequences

Positive:

- Backend and frontend now share a stable semantic model for bulk outcomes.
- Contract tests and Playwright bulk tests can target deterministic result rules.
- The Inbox bulk slice can be implemented without redefining row-level semantics.

Negative / Risks:

- Partial success introduces more response detail than the current row-level response shape.
- Frontend state handling becomes more complex because selection, feedback, and per-item outcomes must remain consistent.
- Gmail side effects remain stubbed, so early bulk validation will cover app semantics and contract behavior, not real Gmail execution.

Mitigations:

- Keep row-level semantics unchanged and scope this ADR to bulk behavior only.
- Reuse the dedicated `/api/v1/inbox/actions` contract from ADR 007.
- Add targeted backend contract tests and frontend browser tests for the bulk slice after implementation.
