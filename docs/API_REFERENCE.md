# API Reference — Email Cleaner & Smart Notifications

Official public reference for the HTTP API exposed by the Email Cleaner backend.

This document is intended for:
- Frontend developers integrating the UI
- External services consuming the API
- Test and tooling integrations

All routes below are **stable v1** endpoints.

---

## 1. Authentication

All protected endpoints require a valid **Google OAuth2 Bearer token**.

Include it in the `Authorization` header:

```bash
-H "Authorization: Bearer <ACCESS_TOKEN>"
```

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
Authorization: Bearer <ACCESS_TOKEN>
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
- `clasificacion` on each suggestion is the ML classification label.

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

## 3. Suggestions API

### 3.1 GET /api/v1/suggestions

Returns Gmail emails **enriched with AI-generated suggestions**.

#### Description

* Backend fetches recent emails from Gmail.
* Emails are sent to the ML service.
* The response includes a `suggestions` array per email.

#### Request

```http
GET /api/v1/suggestions HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
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
          "clasificacion": "promotions_old",
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

## 4. Notifications API

The Notifications API exposes endpoints to:

* Get a **summary of suggested actions**
* **Confirm** actions taken on emails
* Retrieve the **history** of actions per user
* Consume a timeline of **notification events** (event store / audit log style)

All routes share:

* `Authorization: Bearer <ACCESS_TOKEN>`
* Prefix: `/api/v1/notifications/...`

---

### 4.1 GET /api/v1/notifications/summary

Returns a summary list of emails with suggested actions to review.

#### Description

* Intended for “overview” dashboards.
* Each item represents an email plus a list of suggested actions (e.g., archive, delete, move).

#### Request

```http
GET /api/v1/notifications/summary HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
```

#### Query Parameters

* `period` *(optional, string)* — `daily` or `weekly`.
  Used to filter the summary window.

#### Response 200 (example)

```json
[
  {
    "id": "test1",
    "from": "noti@demo.com",
    "subject": "Notification demo",
    "date": "2025-11-18T02:32:11.000Z",
    "isRead": false,
    "category": "demo",
    "attachmentSizeMb": 0.1,
    "suggestions": [
      {
        "action": "archive",
        "clasificacion": "demo",
        "confidence_score": 0.7
      }
    ]
  }
]
```

#### Possible Status Codes

* **200 OK** – Summary returned successfully.
* **401 Unauthorized** – Missing or invalid token.

---

### 4.2 POST /api/v1/notifications/confirm

Confirms actions for one or more emails (e.g., accept or reject suggested actions).

#### Description

* Used by the UI when the user confirms or rejects suggested actions.
* Internally, the backend may:

  * Execute Gmail actions.
  * Record entries in the action history.

#### Request

```http
POST /api/v1/notifications/confirm HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
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

### 4.3 GET /api/v1/notifications/history

Returns the history of actions taken on emails for the authenticated user.

#### Description

* Used to display “what has been done” over time.
* Returns a paginated list of action records.

#### Request

```http
GET /api/v1/notifications/history HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
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

### 4.4 GET /api/v1/notifications/events

Lists notification events with pagination. Useful to consume a timeline of system/user events related to notifications.

#### Description

* Supports filtering by `type` and by `userId`.
* Records are stored with `timestamps: true`, so `createdAt`/`updatedAt` are always present and map to Sequelize defaults.

#### Request

```http
GET /api/v1/notifications/events HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
```

#### Query Parameters

* `page` *(optional, integer, default: 1)* — Page number.
* `perPage` *(optional, integer, default: 20)* — Items per page.
* `type` *(optional, string)* — Filter by canonical domain event type string.
* `userId` *(optional, string)* — Filter by user identifier.

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

## 5. Health Check

### 5.1 GET /api/v1/health

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

## 6. Error Summary

| Status Code | Meaning                           | Typical Cause                           |
| ----------- | --------------------------------- | --------------------------------------- |
| 200         | OK                                | Successful request                      |
| 400         | Bad Request                       | Invalid body or query parameters        |
| 401         | Unauthorized                      | Missing or invalid `Authorization`      |
| 422         | Validation Error (if configured)  | Payload does not match expected shape   |
| 503         | ML Service Unavailable (internal) | ML failure; suggestions fall back to [] |

> Note: When the ML service fails, the API **does not** return 5xx to the client.
> It returns a valid 200 response with empty `suggestions` arrays.

---

## 7. Developer Notes

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

## 8. Versioning & Updates

* API version: **v1** (`/api/v1/...`).
* Last update: 2025 

---
