# ADR 005: Persist refreshed Google access tokens

- Status: accepted
- Date: 2026-01-12

## Context
The backend stores Google `refresh_token` values in the `Tokens` table. The Gmail client uses OAuth2 credentials and can refresh access tokens at runtime, but refreshed tokens were not persisted back to the database. This caused the database to remain stale after refresh events.

## Decision
When the OAuth2 client emits refreshed tokens, persist updated `access_token`, `refresh_token`, and `expiry_date` back to the `Tokens` table. This is implemented in `src/services/googleAuthService.js` by registering a `tokens` listener on the OAuth2 client and updating the token record.

## Consequences
- The database remains consistent with the latest Google tokens.
- Token refreshes do not require re-authentication.
- Token persistence adds a DB write path to the OAuth2 client lifecycle.
