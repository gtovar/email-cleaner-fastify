# Google OAuth Playbook

This document describes how to configure Google OAuth for the Fastify backend.

## 1) Create a Google Cloud project
- Create or select a GCP project.
- Enable the **Gmail API**.

## 2) Configure OAuth consent screen
- Select the user type (internal or external).
- Add the scopes required by Gmail (read-only unless you need write actions).

## 3) Create OAuth credentials
- Create an **OAuth client ID** (Web application).
- Add the redirect URI:
  - `http://localhost:3000/auth/google/callback`

## 4) Configure environment variables
Set these in your backend `.env` file:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
FRONTEND_ORIGIN=http://localhost:5173
TOKEN_ENCRYPTION_KEY=<base64-32-bytes>
```

## 5) Validate the flow
- Visit `GET /auth/google` to start the OAuth flow.
- After consent, the backend:
  - stores Google tokens,
  - issues a `session_token` cookie,
  - redirects to `${FRONTEND_ORIGIN}/auth/callback`.
