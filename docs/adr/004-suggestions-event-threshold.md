# ADR 004: Publish suggestions events only above a threshold

- Status: accepted
- Date: 2026-01-11

## Context

The backend emits `domain.suggestions.generated` events to populate `NotificationEvent` summaries. When very few suggestions are generated, these events create low-signal entries and inflate the summary feed without improving UI value.

## Decision

Publish `domain.suggestions.generated` only when the total suggestions count is **>= 10**. The total is derived from `buildNewSuggestionsEvent({ userId, suggestions })` and the decision is enforced in `src/controllers/suggestionController.js` before `eventBus.publish`.

## Consequences

- Reduces low-signal `NotificationEvent` records and summary noise.
- The `/api/v1/notifications/summary` aggregate may show fewer events when the threshold is not met.
- If the threshold changes in the future, both the controller and the documentation must be updated.
