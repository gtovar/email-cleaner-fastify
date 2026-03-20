# ADR 009: Email content route for receipt extraction

- Status: accepted
- Date: 2026-03-19
- Commit hash: bb684e1

## Context

The frontend `HU_05` receipt-review flow needs to call `POST /api/v1/receipt-detection/extract`.
That route already exists and requires `subject`, `body`, and optional `html`.

The existing `/api/v1/emails` contract only returns Inbox metadata such as `id`, `subject`, `from`, `date`, `labels`, and `snippet`.
It does not expose full email content by `emailId`.

The system therefore needs a small authenticated route that can retrieve normalized full email content for one selected message without changing:

- `GET /api/v1/emails`
- `POST /api/v1/receipt-detection/extract`
- `POST /api/v1/notifications/receipt-whatsapp`

This decision is architectural because it adds a new HTTP contract and extends the Inbox source/service boundary from list-only access to single-message content retrieval.

## Options considered

- Add `body` and `html` directly to `GET /api/v1/emails`
- Add a new authenticated route `GET /api/v1/emails/:id/content`
- Change receipt extraction so it no longer requires `body`

## Decision

Add a new authenticated route at `GET /api/v1/emails/:id/content`.

The route returns a minimal normalized contract:

- `id`
- `subject`
- `from`
- `body`
- `html`

`body` is required and non-empty.
`html` is always present as `string | null`.

The existing `/api/v1/emails` list contract remains unchanged.
Receipt extraction and WhatsApp delivery routes remain unchanged.

The Inbox source boundary is extended with a dedicated content-fetch method so Gmail-backed and fixture-backed sources can both support the route without changing list behavior.

## Consequences

- Positive impacts:
  - Unblocks frontend receipt review without redesigning the list contract.
  - Keeps content retrieval additive and scoped to one selected email.
  - Preserves the existing extraction contract.
- Negative impacts:
  - Adds a new authenticated HTTP contract to maintain.
  - Extends the Gmail and fixture inbox source responsibilities.
- Risks:
  - MIME parsing can grow if the slice tries to solve every message shape.
  - Error semantics can drift if missing messages and normalization failures are not separated.
- Mitigations:
  - Keep MIME/body normalization intentionally minimal.
  - Freeze semantics for `200`, `401`, `404`, and `500`.
  - Require a non-empty normalized `body` and reject empty content.
