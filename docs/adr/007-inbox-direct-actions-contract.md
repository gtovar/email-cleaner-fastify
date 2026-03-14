# ADR 007: Inbox Direct Actions Contract

## Status
Accepted

## Context
`src/components/InboxList.jsx` renders direct and bulk controls for `Archivar`, `Marcar no leído`, and `Eliminar`.
Those controls are visible in the authenticated Inbox UI, but they are not wired to any real behavior.

The current backend contract is suggestion-oriented:
- `POST /api/v1/notifications/confirm` is documented for `accept` and `reject`
- `src/services/notificationsService.js` executes Gmail side effects only for `accept`
- `src/routes/notificationsRoutes.js` already exposes a broader enum in some places, which creates ambiguity

The system currently mixes two different concepts:
- confirming an AI suggestion
- performing a direct user-initiated Inbox action

Those flows should not share semantics by accident.

## Decision
Inbox direct actions will use a **dedicated contract**, separate from `POST /api/v1/notifications/confirm`.

The target direction is:
- keep `POST /api/v1/notifications/confirm` for suggestion confirmation only
  - actions: `accept`, `reject`
- introduce a dedicated Inbox action flow for direct user-initiated actions
  - target endpoint: `POST /api/v1/inbox/actions`
  - target actions: `archive`, `delete`, `mark_unread`

### Proposed request shape

```json
{
  "emailIds": ["18c8f6e...", "18c8f7a..."],
  "action": "archive"
}
```

### Proposed response guarantees

```json
{
  "success": true,
  "processed": 2,
  "emailIds": ["18c8f6e...", "18c8f7a..."],
  "action": "archive",
  "source": "inbox"
}
```

### Product rules

- Inbox remains read-only for message content, but action controls can execute direct user-approved operations.
- Destructive actions must require explicit user confirmation in the UI before the request is sent.
- Suggestion confirmation and direct Inbox actions must remain distinguishable in history, analytics, and future eventing.

### Backend rules

- Gmail side effects for Inbox actions must not be hidden behind `accept`.
- The backend must record Inbox actions distinctly from suggestion confirmations.
- API documentation must not advertise the new Inbox contract until implementation exists.

## Alternatives Considered
1) Reuse `POST /api/v1/notifications/confirm`
   - Rejected: it keeps suggestion semantics and direct Inbox actions mixed under one contract.
   - Rejected: current docs and service behavior already show drift around this ambiguity.

2) Remove Inbox action controls and keep Inbox permanently read-only
   - Rejected for now: the product already exposes those controls, so the better path is to turn them into an explicit feature instead of leaving them ambiguous.

3) Keep placeholder UI without a tracked contract
   - Rejected: it preserves user-facing ambiguity and increases cross-repo drift.

## Consequences
- Frontend and backend can evolve HU19 under a clear product boundary.
- `POST /api/v1/notifications/confirm` stays stable for suggestion workflows.
- A future implementation will require:
  - new route/controller/service contract
  - UI confirmation behavior for destructive actions
  - tests for single and bulk Inbox actions
  - history/event semantics that distinguish `source: inbox` from `source: suggestions`
