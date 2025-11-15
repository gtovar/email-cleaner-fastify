# Emails API Reference (v1)

> Base URL: /api/v1

---

## API Notes

* Official Status (v1): Stable contract, covered by unit and integration tests.
* Experimental Status: Subject to change without notice; use at your own risk.
* Official Specification: Generated dynamically from the code (schemas in routes). The src/swagger.yaml file is not used at runtime.

### Implementation Notes (Fastify)

* Always version APIs under /api/v1.
* Validate all payloads with @fastify/ajv.
* Return correct HTTP status codes (200, 201, 400, 404).
* Always include pagination metadata: page, limit, total, and items.
* Ensure PATCH operations are idempotent.

---

## Emails API — Official v1

### 1. Create a New Classification Rule

Method: POST /api/v1/emails/rules

Description:
Creates a new classification rule to be applied to incoming emails (by subject, sender, or body content) and defines the corresponding action (label, archive, notify, etc.).

#### Request Body (JSON)
{
  "name": "CFE Invoice Rule",
  "match": {
    "from": ["invoices@cfe.mx", "alerts@cfe.mx"],
    "subjectContains": ["bill", "electricity", "CFE"],
    "bodyContainsAny": ["due", "payment"]
  },
  "action": {
    "label": "Finance/Utilities/CFE",
    "notify": ["telegram"],
    "archive": true
  },
  "enabled": true,
  "priority": 10
}

#### Successful Response (201 Created)
{
  "id": "rul_01HZXQ6W6F",
  "name": "CFE Invoice Rule",
  "enabled": true,
  "priority": 10,
  "createdAt": "2025-11-06T02:21:34.000Z",
  "updatedAt": "2025-11-06T02:21:34.000Z"
}

### 2. Retrieve Classified Emails

Method: GET /api/v1/emails

Description:
Returns a paginated list of classified emails, including categories and suggested actions.

#### Query Parameters

| Parameter | Type    | Required | Description                     |
| :-------- | :------ | :------- | :------------------------------ |
| page    | integer | No       | Current page (default 1).       |
| limit   | integer | No       | Page size (default 20).         |
| label   | string  | No       | Filter by category or tag.      |
| from    | string  | No       | Filter by sender.               |
| since   | string  | No       | Minimum date (ISO 8601).        |
| until   | string  | No       | Maximum date (ISO 8601).        |

#### Example Response (200 OK)
{
  "page": 1,
  "limit": 20,
  "total": 132,
  "items": [
    {
      "id": "msg_01HZXT0W1E",
      "from": "invoices@cfe.mx",
      "subject": "Your electricity bill is ready",
      "receivedAt": "2025-11-02T14:10:05.000Z",
      "labels": ["Finance", "Utilities", "CFE"],
      "classification": {
        "category": "Finance/Utilities/CFE",
        "confidence": 0.94
      },
      "actions": {
        "suggested": ["label", "archive", "notify:telegram"],
        "applied": ["label"]
      }
    }
  ]
}

### 3. Update an Existing Rule

Method: PATCH /api/v1/emails/rules/:ruleId

Description:
Partially updates an existing rule (e.g., change priority or toggle enabled).

#### Example Request Body
{
  "enabled": false,
  "priority": 20
}

#### Example Response (200 OK)
{
  "id": "rul_01HZXQ6W6F",
  "name": "CFE Invoice Rule",
  "enabled": false,
  "priority": 20,
  "updatedAt": "2025-11-06T02:28:11.000Z"
}

### 4. Classification Suggestion

Method: POST /api/v1/emails/suggest

Description:
This microservice receives email metadata and returns classification or cleanup suggestions.

#### Example Request Body
{
  "from": "invoices@cfe.mx", 
  "subject": "Your electricity bill is ready", 
  "body": "Due date: November 15. Amount: $350."
}

#### Example Response (200 OK)
{
  "category": "billing",
  "action": "pay",
  "confidence": 0.93
}

### 5. Sugerencias de limpieza (Fastify ↔ Python classifier)

#### 5.1 Endpoint público Fastify

**Method:** `GET /api/v1/suggestions`  
**Auth:** `Bearer <token>` (JWT)  

Este endpoint devuelve una lista de correos enriquecidos con sugerencias automáticas de limpieza.  
Es el punto de entrada “oficial” del backend Fastify hacia el microservicio de IA en Python.

**Ejemplo de respuesta (200 OK)**

```json
{
  "emails": [
    {
      "id": "abc123",
      "from": "notificaciones@ejemplo.com",
      "subject": "Promoción especial",
      "date": "2024-07-01T12:00:00Z",
      "isRead": false,
      "category": "promotions",
      "attachmentSizeMb": 2.5,
      "suggestions": [
        {
          "action": "archive",
          "category": "promotions",
          "confidence_score": 0.91
        }
      ]
    }
  ]
}
```

Internamente, esta ruta delega en el controlador `getSuggestedEmails`, que a su vez usa el servicio `suggestActions` (`src/services/emailSuggester.js`).

---

#### 5.2 Contrato Fastify → Python (microservicio clasificador)

El servicio `suggestActions(emails)` arma la petición al microservicio Python:

* **URL base:** `FASTAPI_URL` (variable de entorno)
* **Endpoint completo:** `POST ${FASTAPI_URL}/suggest`
* **Headers:** `Content-Type: application/json`
* **Body:** *array* de correos con metadatos mínimos:

```json
[
  {
    "id": "abc123",
    "from": "notificaciones@ejemplo.com",
    "subject": "Promoción especial",
    "date": "2024-07-01T12:00:00Z",
    "isRead": false,
    "category": "promotions",
    "attachmentSizeMb": 2.5
  }
]
```

#### 5.3 Contrato Python → Fastify (respuesta esperada)

El microservicio Python devuelve un **mapa de sugerencias** por `id` de correo:

```json
{
  "abc123": [
    {
      "action": "archive",
      "category": "promotions",
      "confidence_score": 0.91
    }
  ],
  "def456": [
    "{\"action\":\"keep\",\"category\":\"inbox\",\"confidence_score\":0.42}"
  ]
}
```

Notas importantes:

* El backend es tolerante a “sugerencias mal formadas”:

  * Si viene un string JSON, se hace `JSON.parse(...)`.
  * Si el parse falla, se ignora esa sugerencia puntual.
* Cada sugerencia se normaliza al shape:

```ts
{
  action: string;
  category: string;
  confidence_score: number;
}
```

#### 5.4 Comportamiento en error

Si el clasificador Python:

* responde con un status **no 2xx**, o
* hay error de red / timeout,

el servicio `suggestActions` **no rompe el flujo**. En su lugar:

```json
{
  "emails": [
    {
      "id": "abc123",
      "from": "notificaciones@ejemplo.com",
      "subject": "Promoción especial",
      "date": "2024-07-01T12:00:00Z",
      "isRead": false,
      "category": "promotions",
      "attachmentSizeMb": 2.5,
      "suggestions": []
    }
  ]
}
```

Es decir: el usuario recibe igual los correos, pero sin sugerencias (lista vacía), y el error queda logueado en el backend.

---

## Notifications API

> Base URL: /api/v1/notifications
>
> Required Header: Authorization: Bearer <token_oauth_google>

### 1. Retrieve Notifications Summary

Method: GET /api/v1/notifications/summary

Description:
Returns the list of suggested notifications for the authenticated user.

#### Query Parameters

| Parameter | Type   | Required | Description               |
| :-------- | :----- | :------- | :------------------------ |
| period  | string | No       | Period filter (e.g., daily). |

#### Response (200 OK)
[
  {
    "id": "test1",
    "from": "noti@demo.com",
    "subject": "¡Prueba HU4!",
    "date": "2025-11-14T06:59:21.250Z",
    "isRead": false,
    "category": "demo",
    "attachmentSizeMb": 0.1,
    "suggestions": ["archive"]
  }
]

### 2. Confirm Notifications

Method: POST /api/v1/notifications/confirm

Description:
Confirms one or more notifications and logs the action taken (currently `accept` or `reject`).

#### Request Body (JSON)
{
  "ids": ["test1"],
  "action": "accept"
}

#### Response (200 OK)
{
  "success": true,
  "processed": 1
}

### 3. Retrieve Actions History

Method: GET /api/v1/notifications/history

Description:
Returns the paginated history of actions performed on notifications.

#### Response (200 OK)
{
  "total": 2,
  "page": 1,
  "perPage": 20,
  "data": [
    {
      "userId": "demo-user",
      "emailId": "test1",
      "action": "accept",
      "timestamp": "2025-11-14T07:11:20.364Z",
      "details": {}
    }
  ]
}

---

## Rules API — Experimental

### 1. List Classification Rules

Method: GET /api/v1/emails/rules

Description:
Lists classification rules. Experimental: the schema may change.

#### Response (200 OK)
[
  { "id": 1, "pattern": "cfe.mx", "label": "billing" }
]

---

Last Updated: July 2025
