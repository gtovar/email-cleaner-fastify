# API Reference — Email Cleaner & Smart Notifications

Official public reference for the HTTP API exposed by the Email Cleaner backend.

This document is intended for:
- Frontend developers integrating the UI
- External services consuming the API
- Test and tooling integrations

All routes below are **stable v1** endpoints.

---

## 1. Authentication

All protected endpoints require a valid **app session cookie** (`session_token`).

The cookie is set by the backend after Google OAuth completes:
- `GET /auth/google` initiates OAuth
- `GET /auth/google/callback` exchanges the code, stores Google tokens, sets the session cookie, and redirects to `${FRONTEND_ORIGIN}/auth/callback`

For API tools, the same JWT can also be sent as `Authorization: Bearer <SESSION_TOKEN>`.

If the token is missing or invalid, the API will return **401 Unauthorized**.

---

## 2. Emails API

### 2.1 GET /api/v1/emails

Returns the list of Gmail emails with optional filters **without any AI processing**.

#### Description

* Fetches emails from Gmail.
* Applies optional Gmail query filters.
* No ML classification or suggestions.

#### Request

```http
GET /api/v1/emails HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
```

#### Query Parameters

* `unread` *(optional, boolean)* — Only unread emails.
* `olderThan` *(optional, integer)* — Older than N days.
* `category` *(optional, string)* — Gmail category: `promotions`, `social`, `updates`, `forums`, `primary`.
* `minAttachmentSize` *(optional, integer)* — Attachments larger than N MB.
* `pageToken` *(optional, string)* — Gmail pagination token.

#### Response 200 (example)

Notes:
- `category` on the email is the Gmail category (labels).
- `classification` on each suggestion is the ML classification label.

```json
{
  "emails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Your power bill",
      "date": "2025-11-18T02:32:11.000Z",
      "labels": ["INBOX", "UNREAD"],
      "isRead": false,
      "attachmentSizeMb": 1.2,
      "category": "promotions",
      "snippet": "Due on November 15...",
      "hasAttachment": false,
      "size": 52310
    }
  ],
  "nextPageToken": "xyz...",
  "total": 25
}
```

#### Possible Status Codes

* **200 OK** – Emails returned successfully.
* **401 Unauthorized** – Missing or invalid token.

---

## 3. Inbox Actions API

### 3.1 POST /api/v1/inbox/actions

Executes direct user-initiated Inbox actions for one or more emails.

#### Description

* Separate from suggestion confirmation.
* Intended for explicit Inbox operations initiated from the frontend Inbox surface.
* Records action history with `details.source = "inbox"`.
* Preserves per-item outcomes even if ActionHistory persistence fails after item execution completes.

#### Request

```http
POST /api/v1/inbox/actions HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
Content-Type: application/json
```

#### Request Body

```json
{
  "emailIds": ["18c8f6e...", "18c8f7a..."],
  "action": "archive"
}
```

* `emailIds` *(array of strings, required)* — Email IDs to process.
* `action` *(string, required)* — One of: `archive`, `delete`, `mark_unread`.

#### Response 200 (example)

```json
{
  "success": true,
  "execution": "partial",
  "action": "archive",
  "source": "inbox",
  "summary": {
    "total": 2,
    "processed": 1,
    "failed": 1
  },
  "results": [
    { "emailId": "18c8f6e...", "status": "ok" },
    { "emailId": "18c8f7a...", "status": "error", "reason": "not_found" }
  ]
}
```

Response rules:

* `success` represents request-level execution, not “all items succeeded”.
* `execution` is one of `full`, `partial`, or `none`.
* `results` preserves one outcome per requested email ID.
* If ActionHistory persistence fails after one or more items were already executed, the response still preserves the computed per-item outcomes instead of collapsing everything into `system_error`.

#### Possible Status Codes

* **200 OK** – Actions processed successfully.
* **400 Bad Request** – Invalid payload.
* **401 Unauthorized** – Missing or invalid token.

---

## 4. Suggestions API

### 3.1 GET /api/v1/suggestions

Returns Gmail emails **enriched with AI-generated suggestions**.

#### Description

* Backend fetches recent emails from Gmail.
* Emails are sent to the ML service.
* The response includes a `suggestions` array per email.

#### Request

```http
GET /api/v1/suggestions HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
```

#### Response 200 (example)

```json
{
  "emails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Your power bill",
      "date": "2025-11-18T02:32:11.000Z",
      "isRead": false,
      "category": "promotions",
      "attachmentSizeMb": 1.2,
      "suggestions": [
        {
          "action": "archive",
          "classification": "promotions_old",
          "confidence_score": 0.85
        }
      ]
    }
  ]
}
```

#### ML Failure Behavior

If the ML service is unavailable (timeout, network error, 5xx):

* The endpoint **still returns 200 OK**.
* Each email will include an **empty `suggestions` array**.

Example:

```json
{
  "emails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Your power bill",
      "snippet": "Due on November 15...",
      "date": "2025-11-18T02:32:11.000Z",
      "suggestions": []
    }
  ]
}
```

#### Possible Status Codes

* **200 OK** – Emails returned successfully (with or without suggestions).
* **401 Unauthorized** – Missing or invalid token.

---

## 5. Notifications API

The Notifications API exposes endpoints to:

* Get a **summary of suggested actions**
* **Confirm** actions taken on emails
* Retrieve the **history** of actions per user
* Consume a timeline of **notification events** (event store / audit log style)

All routes share:

* `Cookie: session_token=<SESSION_TOKEN>`
* Prefix: `/api/v1/notifications/...`

---

### 5.1 GET /api/v1/notifications/summary

Returns an aggregate summary of suggested actions for a time window.

#### Description

* Intended for “overview” dashboards.
* Aggregates counts from `NotificationEvent` records.
* `NotificationEvent` records are created only when generated suggestions reach the publish threshold.

#### Request

```http
GET /api/v1/notifications/summary HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
```

#### Query Parameters

* `period` *(optional, string)* — `daily` or `weekly`.
  Used to filter the summary window (rolling last 24 hours or rolling last 7 days).
  Windows are evaluated in UTC over persisted `NotificationEvent.createdAt` values and are inclusive on both boundaries.
  If omitted, the summary covers all time and `windowStart`/`windowEnd` are `null`.

#### Response 200 (example)

```json
{
  "period": "weekly",
  "windowStart": "2026-03-01T10:00:00.000Z",
  "windowEnd": "2026-03-08T10:00:00.000Z",
  "totalEvents": 4,
  "totalSuggestions": 12,
  "totalConfirmed": 3,
  "suggestedActions": {
    "archive": 7,
    "delete": 5
  },
  "confirmedActions": {
    "accept": 3
  },
  "classifications": {
    "promotions_old": 6,
    "stale_unread": 6
  }
}
```

#### Possible Status Codes

* **200 OK** – Summary returned successfully.
* **401 Unauthorized** – Missing or invalid token.

---

### 5.2 POST /api/v1/notifications/confirm

Confirms actions for one or more emails (e.g., accept or reject suggested actions).

#### Description

* Used by the UI when the user confirms or rejects suggested actions from Suggestions.
* Internally, the backend may:

  * Execute Gmail actions.
  * Record entries in the action history.

#### Request

```http
POST /api/v1/notifications/confirm HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
Content-Type: application/json
```

#### Request Body

```json
{
  "emailIds": ["18c8f6e...", "18c8f7a..."],
  "action": "accept"
}
```

* `emailIds` *(array of strings, required)* — Email IDs to process.
* `action` *(string, required)* — One of: `accept`, `reject`.

#### Response 200 (example)

The schema guarantees:

```json
{
  "success": true,
  "processed": 2,
  "emailIds": ["18c8f6e...", "18c8f7a..."],
  "action": "accept",
  "data": [
    {
      "userId": "user-123",
      "emailId": "18c8f6e...",
      "action": "accept",
      "timestamp": "2025-11-18T02:32:11.000Z",
      "details": {
        "gmailResponse": { "status": "OK" },
        "note": "Executed"
      }
    }
  ]
}
```

> Note: The internal implementation may include additional fields,
> but `success`, `processed`, `emailIds` and `action` are guaranteed by contract.

#### Possible Status Codes

* **200 OK** – Actions processed successfully.
* **400 Bad Request** – Invalid payload (e.g., missing `emailIds` or `action`).
* **401 Unauthorized** – Missing or invalid token.

---

### 5.3 GET /api/v1/notifications/history

Returns the history of actions taken on emails for the authenticated user.

#### Description

* Used to display “what has been done” over time.
* Returns a paginated list of action records.
* History may now contain both suggestion-confirm actions and Inbox direct actions, distinguishable through `details.source`.

#### Request

```http
GET /api/v1/notifications/history HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
```

#### Query Parameters

* `page` *(optional, integer, default: 1)* — Page number.
* `perPage` *(optional, integer, default: 20)* — Items per page.

#### Response 200 (example)

```json
{
  "total": 3,
  "page": 1,
  "perPage": 20,
  "data": [
    {
      "userId": "user-123",
      "emailId": "18c8f6e...",
      "action": "accept",
      "timestamp": "2025-11-18T02:32:11.000Z",
      "details": {
        "source": "suggestions",
        "gmailResponse": { "status": "OK" },
        "note": "Executed"
      }
    }
  ]
}
```

#### Possible Status Codes

* **200 OK** – History returned successfully.
* **401 Unauthorized** – Missing or invalid token.

---

### 5.4 GET /api/v1/notifications/events

Lists notification events with pagination. Useful to consume a timeline of system/user events related to notifications.

#### Description

* Supports filtering by `type` and by `userId`.
* Records are stored with `timestamps: true`, so `createdAt`/`updatedAt` are always present and map to Sequelize defaults.

#### Request

```http
GET /api/v1/notifications/events HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
```

#### Query Parameters

* `page` *(optional, integer, default: 1)* — Page number.
* `perPage` *(optional, integer, default: 20)* — Items per page.
* `type` *(optional, string)* — Filter by canonical domain event type string.
* `userId` *(optional, string)* — Filter by user identifier. When omitted, the endpoint falls back to the authenticated user from the session/JWT.

**Canonical rule:** The `type` query parameter filters by the **canonical domain event type string** (e.g., `domain.suggestions.generated`, `domain.suggestions.confirmed`). Legacy labels such as `NEW_SUGGESTIONS` / `NEW_SUGGESTIONS_EVENT` are **not supported** in `src/**` or `tests/**` and may appear only in documentation under a **DEPRECATED** section for historical traceability.

#### Response 200 (example)

```json
{
  "total": 1,
  "page": 1,
  "perPage": 20,
  "data": [
    {
      "type": "domain.suggestions.generated",
      "userId": "demo-user",
      "summary": {
        "totalSuggestions": 3,
        "sampledEmails": []
      },
      "createdAt": "2025-11-18T02:32:11.000Z",
      "updatedAt": "2025-11-18T02:32:11.000Z"
    }
  ]
}
```

#### Possible Status Codes

* **200 OK** – Events returned successfully.
* **401 Unauthorized** – Missing or invalid token.

---

### 5.5 POST /api/v1/notifications/receipt-whatsapp

Sends a WhatsApp reminder for a detected invoice when `{ emailId, sender, subject, amount, due_date, phone }` are provided. The controller simply forwards the validated payload to `src/services/notifications/receiptNotificationService.js`, which assembles the reminder text, calls the sandboxed Twilio adapter in `src/services/notifications/twilioAdapter.js`, and logs every attempt via `src/services/notifications/notificationDeliveryLogService.js`.

#### Description

* Designed for HU_03 workflows that already extracted amount and due date; the service skips delivery when either field is `null` and records `status: 'skipped'` with `reason: 'missing_extracted_fields'`.
* If the `phone` payload is empty or whitespace, the service skips again with `status: 'skipped'` and `reason: 'missing_recipient'`.
* When fields are valid, the service trims `sender`/`subject`, formats `Recordatorio: ...`, calls the Twilio adapter, logs a `sent` record with `providerMessageId` and `channel: 'whatsapp'`, and returns the adapter’s stable response. Provider failures are rescued, logged as `status: 'failed'` with `reason: 'provider_error'`, and surfaced as `{ sent: false, reason: 'provider_error' }`.

#### Request

```http
POST /api/v1/notifications/receipt-whatsapp HTTP/1.1
Cookie: session_token=<SESSION_TOKEN>
Content-Type: application/json
```

#### Request Body

```json
{
  "emailId": "string",
  "sender": "string",
  "subject": "string",
  "amount": "string",      // null allowed but triggers skipped delivery
  "due_date": "string",   // null allowed but triggers skipped delivery
  "phone": "string"
}
```

* `emailId` *(required)* — Used for audit logs (`notificationDeliveryLogService.logDelivery`).
* `sender` / `subject` *(required strings)* — Trimmed values; defaults to `Remitente desconocido` / `recibo detectado` when blank to keep the message human readable.
* `amount` / `due_date` *(required but nullable)* — Extraction output from HU_03; `null` values immediately return `missing_extracted_fields` and log a `skipped` entry.
* `phone` *(required string)* — WhatsApp recipient; trimmed and validated. Blank values stop the workflow with `reason: 'missing_recipient'`.

#### Response 200 (success example)

```json
{
  "sent": true,
  "provider": "twilio",
  "status": "sent",
  "providerMessageId": "twilio-sandbox-message-id"
}
```

#### Response 200 (skip/failure examples)

```json
{
  "sent": false,
  "reason": "missing_extracted_fields"
}
```

```json
{
  "sent": false,
  "reason": "missing_recipient"
}
```

```json
{
  "sent": false,
  "reason": "provider_error"
}
```

> Every request is mirrored in the delivery log (`notificationDeliveryLogService.logDelivery`), which stores `emailId`, `channel`, `status`, optional `reason`, `providerMessageId`, and a `summary` of `sender`, `amount`, and `due_date`. Use `notificationDeliveryLogService.getDeliveries()` in tests to inspect the entries.

#### Possible Status Codes

* **200 OK** – Delivery request accepted; inspect `sent`/`reason` for success, skipped delivery, or provider failure.
* **400 Bad Request** – Ajv schema validation failed (`BODY_SCHEMA` enforces the exact structure and disallows extra properties).
* **401 Unauthorized** – Missing or invalid `session_token` cookie.

#### Tests

* `tests/notificationDeliveryRoutes.test.js` exercises success, missing extraction fields, provider failure, and the route-level 400 for invalid payloads using fixtures under `tests/fixtures/notifications/`.
* `tests/receiptNotificationService.test.js` asserts the service logs `skipped`, `sent`, and `failed` outcomes, and it propagates the stubbed Twilio response when everything is valid.
* `tests/twilioAdapter.test.js` keeps the adapter deterministic, verifies it rejects empty recipients/bodies, and confirms the stable `{ provider, status, providerMessageId }` payload.

## 6. Health Check

### 6.1 GET /api/v1/health

Simple health-check endpoint for monitoring and local diagnostics.

#### Request

```http
GET /api/v1/health HTTP/1.1
```

#### Response 200 (example)

```json
{
  "status": "ok"
}
```

---

## 7. Error Summary

| Status Code | Meaning                           | Typical Cause                           |
| ----------- | --------------------------------- | --------------------------------------- |
| 200         | OK                                | Successful request                      |
| 400         | Bad Request                       | Invalid body or query parameters        |
| 401         | Unauthorized                      | Missing or invalid session token        |
| 422         | Validation Error (if configured)  | Payload does not match expected shape   |
| 503         | ML Service Unavailable (internal) | ML failure; suggestions fall back to [] |

> Note: When the ML service fails, the API **does not** return 5xx to the client.
> It returns a valid 200 response with empty `suggestions` arrays.

---

## 8. Developer Notes

* Backend uses **ECMAScript Modules (ESM)**.
* Gmail is accessed via internal services, not directly from the client.
* ML integration is abstracted through `mlClient`.
* Event types are domain strings (e.g., `domain.suggestions.generated`). For the canonical list and payload contracts, see `docs/events_contract.md`.

Key configuration:

```env
ML_TIMEOUT_MS=5000
ML_BASE_URL=http://localhost:8000
```

---

## 9. Versioning & Updates

* API version: **v1** (`/api/v1/...`).
* Last update: 2025

---
