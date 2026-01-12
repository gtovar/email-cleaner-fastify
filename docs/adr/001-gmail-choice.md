# ADR 001: Gmail authentication via OAuth2

- Status: accepted
- Date: 2025-10-16

## Context
Secure access to Gmail is required. IMAP is simpler but less secure and provides fewer permission controls.

## Decision
Adopt OAuth2 with the minimum required scopes and refreshable tokens.

## Consequences
- Security aligned with Google standards.
- Reduced risk of credential exposure.
- Initial configuration is more complex.
