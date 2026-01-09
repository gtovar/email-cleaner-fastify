# Events Contract

This document defines the **canonical event names** and **payload schemas** used by the Fastify backend EventBus.

## Scope

- Defines **domain events** emitted by the backend.
- Defines the **minimum payload contract** (what consumers may rely on).
- Defines how events are persisted to the lightweight EventStore table (`NotificationEvent`).

Non-goals:
- This is not an API reference for HTTP endpoints (see `docs/API_REFERENCE.md`).
- This is not a full event-sourcing design.

---

## Canonical Event Names

The system uses `DOMAIN_EVENTS` (see `src/events/eventBus.js`) to avoid magic strings.

| Constant | Event name (canonical) | Meaning |
|---|---|---|
| `DOMAIN_EVENTS.SUGGESTIONS_GENERATED` | `domain.suggestions.generated` | Suggestions were generated for a user |
| `DOMAIN_EVENTS.SUGGESTION_CONFIRMED` | `domain.suggestions.confirmed` | The user confirmed actions for one or more emails |

### Canon rule (single source of truth)

- The **only canonical strings** are the ones in the table above.
- New code and tests MUST use:
  - `DOMAIN_EVENTS.<...>` constants, and/or
  - the canonical string values shown in the table.

### Legacy Map (DEPRECATED)

You may still find these legacy names in old notes or historical commits. They are **not allowed** in new code/tests:

- `DOMAIN_EVENTS.SUGGESTION_GENERATED` (singular constant name used historically in docs/notes)
- `NEW_SUGGESTIONS_EVENT`
- `NEW_SUGGESTIONS_AVAILABLE`
- `NEW_SUGGESTIONS`

Rule:
- Legacy labels may appear **only in documentation** under **DEPRECATED** sections for historical traceability.
- Legacy labels MUST NOT appear in `src/**` or `tests/**`.

### API Filtering Rule (Option A)

When filtering or listing stored events via the API (e.g., `/api/v1/notifications/events`), the `type` field and query parameter MUST use the canonical event type string:

- `domain.suggestions.generated`
- `domain.suggestions.confirmed`

Legacy labels (`NEW_SUGGESTIONS`, `NEW_SUGGESTIONS_EVENT`, etc.) are DEPRECATED and must not be used in code/tests.

---

## EventBus Payload Contract

### publish(eventName, payload)

The EventBus is called like:

```js
await eventBus.publish(DOMAIN_EVENTS.SUGGESTIONS_GENERATED, domainEvent);
```

Contract:

* `eventName` MUST be one of the `DOMAIN_EVENTS` constants.
* `payload` MUST be the domain event object (not an envelope).
* `payload.type` MUST match the canonical string value of `eventName`.

Example (conceptual):

```ts
eventName = DOMAIN_EVENTS.SUGGESTIONS_GENERATED
payload.type === "domain.suggestions.generated"
```

---

## Common Domain Event Fields (minimum contract)

All domain events MUST include at least:

```ts
type: string;       // MUST match one of the canonical event type strings
userId: string;     // owner user
summary: object;    // minimal summary for persistence/notifications
generatedAt: string; // ISO timestamp (logical generation time)
```

Additional fields MAY exist depending on the event and builder.

### About createdAt / updatedAt

`createdAt` and `updatedAt` are **persistence timestamps** (Sequelize defaults) for the `NotificationEvent` record.

* Consumers SHOULD NOT assume that `createdAt/updatedAt` exist on the in-memory domain event.
* Consumers MAY rely on `createdAt/updatedAt` in the **persisted** `NotificationEvent` records.

---

## Event: domain.suggestions.generated

### When is it emitted?

When the backend computes suggestions for a user (e.g., GET summary flow).

### Builder

`src/events/builders/newSuggestionsEvent.builder.js`

Signature:

```js
buildNewSuggestionsEvent({ userId, suggestions })
```

### Payload schema (minimum guaranteed)

```json
{
  "type": "domain.suggestions.generated",
  "userId": "demo-user",
  "suggestions": [
    {
      "emailId": "18c8f6e...",
      "subject": "Example",
      "suggestions": ["archive", "delete"]
    }
  ],
  "summary": {
    "totalSuggestions": 5,
    "sampledEmails": [
      {
        "emailId": "18c8f6e...",
        "subject": "Example",
        "suggestions": ["archive", "delete"]
      }
    ]
  },
  "generatedAt": "2025-12-31T00:00:00.000Z"
}
```

Notes:

* Some implementations may include additional fields per suggestion item (e.g., `id`). Such fields are OPTIONAL and should not be required by consumers.

### Consumer expectations

* Consumers should rely on `summary.totalSuggestions` for counts.
* `suggestions` may be large; consumers should not assume it is persisted.

---

## Event: domain.suggestions.confirmed

### When is it emitted?

When the user confirms actions for emails (confirm flow).

### Builder

`src/events/builders/confirmedSuggestionEvent.builder.js`

Signature:

```js
buildConfirmedSuggestionEvent({ userId, emailIds, action })
```

### Payload schema (minimum guaranteed)

```json
{
  "type": "domain.suggestions.confirmed",
  "userId": "demo-user",
  "action": "accept",
  "emailIds": ["18c8f6e...", "18c8f7a..."],
  "summary": {
    "totalConfirmed": 2,
    "action": "accept"
  },
  "generatedAt": "2025-12-31T00:00:00.000Z"
}
```

---

## Persistence: NotificationEvent (Light EventStore)

### What is persisted?

Events are persisted via:

* Subscriber: `src/events/subscribers/registerNotificationEventListeners.js`
* Listener: `src/events/listeners/saveToNotificationEvent.js`
* Command: `src/commands/notification_events/recordNotificationEventCommand.js`
* Model: `src/models/notificationEvent.js`

### Current DB shape (contract for persisted records)

`NotificationEvent` stores:

* `type` (string, required)
* `userId` (string, required)
* `summary` (JSONB, default `{}`)
* timestamps (`createdAt`, `updatedAt`)

### Important limitation (intended behavior)

The persistence layer is expected to store only:

```json
{ "type": "<event.type>", "userId": "<event.userId>", "summary": "<event.summary>" }
```

So:

* `suggestions` is NOT persisted (only `summary` is).
* `emailIds` is NOT persisted directly (only `summary.totalConfirmed` + `summary.action`).

If full payload persistence is needed later, the model and command must be extended intentionally.

---

## Subscribers (current)

Registered in `registerNotificationEventListeners.js`:

* Persist to NotificationEvent:

  * `domain.suggestions.generated`
  * `domain.suggestions.confirmed`

* Debug log:

  * `domain.suggestions.generated`

* Webhook to n8n:

  * `domain.suggestions.generated`

---

