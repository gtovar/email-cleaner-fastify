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

### 2.1 GET /api/v1/mails

Returns the list of base Gmail emails **without any AI processing**.

#### Description

- Fetches raw emails from Gmail.
- No machine learning, no automatic classification.
- This endpoint represents the “raw inbox” view.

#### Request

```http
GET /api/v1/mails HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
```

#### Query Parameters

- `pageToken` *(optional, string)* — Gmail pagination token (if supported by the current implementation).

#### Response 200 (example)

```json
{
  "mails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Your power bill",
      "snippet": "Due on November 15...",
      "date": "2025-11-18T02:32:11.000Z"
    }
  ],
  "nextPageToken": "xyz...",
  "total": 25
}
```

#### Possible Status Codes

- **200 OK** – Mails returned successfully.
- **401 Unauthorized** – Missing or invalid token.

---

## 3. Suggestions API

### 3.1 GET /api/v1/suggestions

Returns Gmail emails **enriched with AI-generated suggestions**.

#### Description

- Backend fetches base emails (similar to `/api/v1/mails`).
- Emails are sent to the ML service.
- The response includes a `suggestions` array per email.

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
      "snippet": "Due on November 15...",
      "date": "2025-11-18T02:32:11.000Z",
      "suggestions": [
        {
          "action": "archive",
          "reason": "low_priority"
        }
      ]
    }
  ]
}
```

#### ML Failure Behavior

If the ML service is unavailable (timeout, network error, 5xx):

- The endpoint **still returns 200 OK**.
- Each email will include an **empty `suggestions` array**.

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

- **200 OK** – Emails returned successfully (with or without suggestions).
- **401 Unauthorized** – Missing or invalid token.

---

## 4. Notifications API

The Notifications API exposes endpoints to:

- Get a **summary of suggested actions**
- **Confirm** actions taken on emails
- Retrieve the **history** of actions per user

All routes share:

- `Authorization: Bearer <ACCESS_TOKEN>`
- Prefix: `/api/v1/notifications/...`

---

### 4.1 GET /api/v1/notifications/summary

Returns a summary list of emails with suggested actions to review.

#### Description

- Intended for “overview” dashboards.
- Each item represents an email plus a list of suggested actions (e.g., archive, delete, move).

#### Request

```http
GET /api/v1/notifications/summary HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
```

#### Query Parameters

- `period` *(optional, string)* — `daily` or `weekly`.  
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
    "suggestions": ["archive"]
  }
]
```

#### Possible Status Codes

- **200 OK** – Summary returned successfully.
- **401 Unauthorized** – Missing or invalid token.

---

### 4.2 POST /api/v1/notifications/confirm

Confirms actions for one or more emails (e.g., accept or reject suggested actions).

#### Description

- Used by the UI when the user confirms or rejects suggested actions.
- Internally, the backend may:
  - Execute Gmail actions.
  - Record entries in the action history.

#### Request

```http
POST /api/v1/notifications/confirm HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

#### Request Body

```json
{
  "ids": ["18c8f6e...", "18c8f7a..."],
  "action": "accept"
}
```

- `ids` *(array of strings, required)* — Email IDs to process.
- `action` *(string, required)* — One of: `accept`, `reject`.

#### Response 200 (example)

The schema guarantees:

```json
{
  "success": true,
  "processed": 2,
  "action": "accept"
}
```

> Note: The internal implementation may include additional fields,  
> but `success`, `processed` and `action` are guaranteed by contract.

#### Possible Status Codes

- **200 OK** – Actions processed successfully.
- **400 Bad Request** – Invalid payload (e.g., missing `ids` or `action`).
- **401 Unauthorized** – Missing or invalid token.

---

### 4.3 GET /api/v1/notifications/history

Returns the history of actions taken on emails for the authenticated user.

#### Description

- Used to display “what has been done” over time.
- Returns a paginated list of action records.

#### Request

```http
GET /api/v1/notifications/history HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
```

#### Query Parameters

- `page` *(optional, integer, default: 1)* — Page number.
- `perPage` *(optional, integer, default: 20)* — Items per page.

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

- **200 OK** – History returned successfully.
- **401 Unauthorized** – Missing or invalid token.

---

### 4.4 GET /api/v1/notifications/events

Lists notification events with pagination. Useful to consume a timeline of system/user events related to notifications.

#### Description

- Supports filtering by `type` and by `userId` (as required by the functional spec).
- Records are stored with `timestamps: true`, so `createdAt`/`updatedAt` are always present and map to Sequelize defaults.

#### Request

```http
GET /api/v1/notifications/events HTTP/1.1
Authorization: Bearer <ACCESS_TOKEN>
```

#### Query Parameters

- `page` *(optional, integer, default: 1)* — Page number.
- `perPage` *(optional, integer, default: 20)* — Items per page.
- `type` *(optional, string)* — Filter by event type (e.g., `NEW_SUGGESTIONS_AVAILABLE`).
- `userId` *(optional, string)* — Filter by user identifier.

#### Response 200 (example)

```json
{
  "total": 1,
  "page": 1,
  "perPage": 20,
  "data": [
    {
      "type": "NEW_SUGGESTIONS_AVAILABLE",
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

- **200 OK** – Events returned successfully.
- **401 Unauthorized** – Missing or invalid token.

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

| Status Code | Meaning                         | Typical Cause                          |
|------------|---------------------------------|----------------------------------------|
| 200        | OK                              | Successful request                     |
| 400        | Bad Request                     | Invalid body or query parameters       |
| 401        | Unauthorized                    | Missing or invalid `Authorization`     |
| 422        | Validation Error (if configured)| Payload does not match expected shape  |
| 503        | ML Service Unavailable (internal)| ML failure; suggestions fall back to []|

> Note: When the ML service fails, the API **does not** return 5xx to the client.  
> It returns a valid 200 response with empty `suggestions` arrays.

---

## 7. Developer Notes

- Backend uses **ECMAScript Modules (ESM)**.
- Gmail is accessed via internal services, not directly from the client.
- ML integration is abstracted through `mlClient`.
- Key configuration:

```env
ML_TIMEOUT_MS=5000
ML_BASE_URL=http://localhost:8000
```

---

## 8. Versioning & Updates

- API version: **v1** (`/api/v1/...`).
- Last update: 2025 — Email Cleaner Engineering Team.

---

# END OF FILE
