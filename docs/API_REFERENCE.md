# Emails API Reference (v1)

> - **Base URL**: `/api/v1`

> **Estatus**
> - **Oficiales v1**: contrato estable, cubierto por pruebas.
> - **Experimental**: sujeto a cambios; uso bajo tu propio riesgo.
> **Especificación oficial de la API**
> Se genera desde el código (esquemas en las rutas y en `src/index.js`). El archivo `src/swagger.yaml` no se usa en tiempo de ejecución.

---
## Emails API — Oficiales v1

## Create a New Classification Rule

**Method:** `POST /api/v1/emails/rules`

**Description:**  
Creates a new **classification rule** to be applied to incoming emails (by subject, sender, or body content) and defines the corresponding action (label, archive, notify, etc.).

### Request Body (JSON)
```json
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
```

### Successful Response
```json
{
  "id": "rul_01HZXQ6W6F",
  "name": "CFE Invoice Rule",
  "enabled": true,
  "priority": 10,
  "createdAt": "2025-11-06T02:21:34.000Z",
  "updatedAt": "2025-11-06T02:21:34.000Z"
}
```

---

## Retrieve Classified Emails

**Method:** `GET /api/v1/emails`

**Description:**  
Returns a paginated list of classified emails, including categories and suggested actions.

### Query Parameters

| Parameter | Type    | Required | Description                |
| --------- | ------- | -------- | -------------------------- |
| `page`    | integer | No       | Current page (default 1).  |
| `limit`   | integer | No       | Page size (default 20).    |
| `label`   | string  | No       | Filter by category or tag. |
| `from`    | string  | No       | Filter by sender.          |
| `since`   | string  | No       | Minimum date (ISO 8601).   |
| `until`   | string  | No       | Maximum date (ISO 8601).   |

### Example Response
```json
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
```

---

## Update an Existing Rule

**Method:** `PATCH /api/v1/emails/rules/:ruleId`

**Description:**  
Partially updates an existing rule (e.g., change priority or toggle `enabled`).

### Example Request Body
```json
{
  "enabled": false,
  "priority": 20
}
```

### Example Response
```json
{
  "id": "rul_01HZXQ6W6F",
  "name": "CFE Invoice Rule",
  "enabled": false,
  "priority": 20,
  "updatedAt": "2025-11-06T02:28:11.000Z"
}
```

---
## Suggest

**Method:** `POST /api/v1/emails/suggest`

**Description:**  
This is a microservice and expose a endpoint POST `/suggest` for recive metadata from email and return suggests of clean.


### Example Request Body
```json
{
  "from": "invoices@cfe.mx", 
  "subject": "Your electricity bill is ready", 
  "body": "Due date: November 15. Amount: $350."
}
```

### Example Response
```json
{
  "category": "billing",
  "action": "pay",
  "confidence": 0.93
}
```


---
## Rules API — Experimental

Method: GET /api/v1/emails/rules

**Description:**
Lista reglas de clasificación. Experimental: el esquema puede cambiar.

### 200 Response
```json
[
  { "id": 1, "pattern": "cfe.mx", "label": "billing" }
]

```

## 🧩 Implementation Notes (Fastify)

- Always version APIs under `/api/v1`.  
- Validate all payloads with `@fastify/ajv`.  
- Return correct HTTP status codes (`200`, `201`, `400`, `404`).  
- Always include pagination metadata: `page`, `limit`, `total`, and `items`.  
- Ensure `PATCH` operations are idempotent.  

---

**Last updated:** July 2025  
