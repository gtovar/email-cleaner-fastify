# System Architecture Diagram

This diagram represents the main data flow of the **Email Cleaner & Smart Notifications** system.

```mermaid
flowchart LR
    A["Start: Gmail API — OAuth2"] --> B["Pre-processing: Fastify Backend (Node.js)\nNormalize and create JSON payload"]
    B --> C["Request: HTTP POST (JSON)"]
    C --> D["Classification: FastAPI (Python ML)\nInference and tagging"]
    D --> E["End: Persistence (PostgreSQL) + Notification (n8n / Telegram)\nSave results and trigger alert"]

```

## Backend Event Flows (CQRS-lite + EventBus)

### Summary Flow (GET /api/v1/notifications/summary)

```mermaid
sequenceDiagram
  participant UI as React UI
  participant R as Fastify Route/Controller
  participant S as notificationsService.getSummaryForUser
  participant Q as summaryQueries
  participant DB as PostgreSQL (NotificationEvent)

  UI->>R: GET /api/v1/notifications/summary (session cookie)
  R->>S: getSummaryForUser({ userId })
  S->>Q: aggregate summary for user
  Q->>DB: SELECT NotificationEvent (windowed)
  Q-->>S: summary
  S-->>R: summary
  R-->>UI: 200 summary
```

```mermaid
flowchart LR
  UI[React UI] -->|GET /api/v1/notifications/summary + session cookie| MW[authMiddleware]
  MW --> CTRL[getSummary controller]
  CTRL --> SVC[notificationsService.getSummary]
  SVC --> QRY[summaryQueries.getNotificationSummaryForUser]
  QRY --> DB[(NotificationEvents table)]
  SVC --> UI
```

### Confirm Flow (POST /api/v1/notifications/confirm)

```mermaid
sequenceDiagram
  participant UI as React UI
  participant R as Fastify Route/Controller
  participant S as notificationsService.confirmActions
  participant G as Gmail Action Executor
  participant C as confirmActionCommand
  participant DB1 as PostgreSQL (ActionHistory)
  participant EB as EventBus
  participant Sub as saveToNotificationEvent listener
  participant Cmd as recordNotificationEventCommand
  participant DB2 as PostgreSQL (NotificationEvent)

  UI->>R: POST /api/v1/notifications/confirm { emailIds, action }
  R->>S: confirmActions({ emailIds, action, userId })

  loop for each emailId
    S->>G: executeGmailAction(emailId, action)
    G-->>S: gmailResponse
  end

  S->>C: bulkCreate ActionHistory + publish confirmed event
  C->>DB1: INSERT ActionHistory rows
  C->>EB: publish(domain.suggestions.confirmed, domainEvent)
  EB-->>Sub: handle(domainEvent)
  Sub->>Cmd: execute({ type, userId, summary })
  Cmd->>DB2: INSERT NotificationEvent
  S-->>R: { success, processed, emailIds, action, data }
  R-->>UI: 200 response
```
#### Semantics (to avoid future confusion)
- `ActionHistory` answers: "Which action did the user execute/confirm on which email?"
- `NotificationEvent` answers: "Which domain events occurred and how do they travel through the pipeline?"
- Both coexist by design: the UI needs a simple history; the system needs auditable events.


```mermaid
flowchart LR
  UI[React UI] -->|POST /api/v1/notifications/confirm {emailIds, action}| MW[authMiddleware]
  MW --> CTRL[confirmActions controller]
  CTRL --> SVC[notificationsService.confirmActions]
  SVC --> CMD1[confirmActionCommand]
  CMD1 --> EXT[Gmail API / side effects (if applicable)]
  SVC --> BUS[eventBus.publish: DOMAIN_EVENTS.SUGGESTION_CONFIRMED]
  BUS --> L1[listener: saveToNotificationEvent]
  L1 --> CMD2[recordNotificationEventCommand]
  CMD2 --> DB[(NotificationEvents table)]
  SVC --> UI
```

---

## Stage Descriptions

### 1️⃣ Start: Gmail API (OAuth2)
- Fetches incoming emails securely using OAuth2 tokens.  
- Read‑only access; no local credential storage.

### 2️⃣ Pre‑Processing: Fastify Backend
- Normalizes and sanitizes the email payload.  
- Converts raw Gmail data into a standardized JSON schema.  
- Logs structural anomalies for debugging.

### 3️⃣ HTTP POST Request
- The backend sends the JSON payload to the Python microservice.  
- Includes an internal authentication token for inter‑service trust.

### 4️⃣ Classification: FastAPI (Python ML)
- Executes a machine‑learning model for text classification.  
- Returns both the **predicted classification** and **recommended action** (archive, notify, label).

### 5️⃣ Persistence & Notification
- Fastify writes classification results to PostgreSQL.  
- Triggers n8n / Telegram notification workflows if required.  
- Returns the final response to the React frontend.

---

## Technical Notes

- **Communication:** RESTful HTTP between Node.js ↔ Python.  
- **Security:** Internal JWT tokens between microservices.  
- **Observability:** Centralized logging via Cloud Logging.  
- **Fault Tolerance:** Automatic retries for transient network failures.  

---

**Last updated:** July 2025  
