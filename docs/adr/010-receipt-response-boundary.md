# ADR 010: Receipt response boundary for manual paid or ignore state

- Status: accepted
- Date: 2026-03-23
- Commit hash: 1eb8224

## Context

`HU_07A` introduces a backend capability to register a manual receipt response after a WhatsApp reminder or receipt-review flow has already identified a target email.

The existing `POST /api/v1/notifications/confirm` contract is already committed to suggestion confirmation semantics:

- request body uses `emailIds` plus `action`
- `action` is restricted to `accept` or `reject`
- `src/services/notificationsService.js` only executes Gmail side effects for `accept`
- `src/commands/notifications/confirmActionCommand.js` persists `ActionHistory` rows and publishes `domain.suggestions.confirmed`

The backend also already exposes receipt-related flows keyed by `emailId`, including:

- `GET /api/v1/emails/:id/content`
- `POST /api/v1/notifications/receipt-whatsapp`

`HU_07A` therefore needs a way to record a manual `paid` or `ignore` response without deforming the existing suggestion-confirmation contract or overloading persistence models that serve other purposes.

This decision is architectural because it adds a new authenticated HTTP boundary and a new persistence model for stable receipt-response state.

## Options considered

- Extend `POST /api/v1/notifications/confirm` so it also accepts `paid` and `ignore`
- Reuse `ActionHistory` or `NotificationEvent` as the primary persistence store for receipt response state
- Add a new `receipt-responses` boundary with a dedicated `ReceiptResponse` persistence model while keeping `targetId` in the HTTP contract and resolving it to `emailId` inside `HU_07A`

## Decision

Add a new authenticated boundary for receipt response state:

- `POST /api/v1/receipt-responses`
- `GET /api/v1/receipt-responses/:targetId`

The HTTP contract uses `targetId` externally.
Inside `HU_07A`, `targetId` is resolved to `emailId`.

The new persistence model is `ReceiptResponse`, stored separately from `ActionHistory` and `NotificationEvent`.
`ReceiptResponse` keeps one current state per `(userId, emailId)` with `response` restricted to `paid` or `ignore`.

`GET /api/v1/receipt-responses/:targetId` returns `200` with `{ targetId, response: null, updatedAt: null }` when no response exists yet.

The existing `POST /api/v1/notifications/confirm` contract remains dedicated to suggestion confirmation with `accept` or `reject`.

## Consequences

- Positive impacts:
  - Keeps receipt-response state semantically separate from suggestion confirmation.
  - Reuses the already-real `emailId` identity without inventing a new aggregate for `HU_07A`.
  - Gives the frontend a stable read/write contract for `HU_07B`.
- Negative impacts:
  - Adds a new authenticated route pair and a new table to maintain.
  - Introduces one more persistence concept in the notifications-adjacent area.
- Risks:
  - `emailId` may not remain the final long-term identity if future phases introduce a stronger receipt aggregate.
  - The new table requires migration rollout discipline in environments that already have the database initialized.
- Mitigations:
  - Keep `targetId` as the external contract name so the API does not hard-code `emailId`.
  - Scope the internal `targetId -> emailId` resolution explicitly to `HU_07A`.
  - Add a dedicated Sequelize migration and route-level contract tests.
