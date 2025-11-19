
---

# ✅ **API_REFERENCE.md (formato TXT)**

````txt
# Emails API Reference (v1)
> Documentación oficial de la API — Email Cleaner & Smart Notifications  
> Actualizado tras la corrección de HU12 (Fastify ↔ ML)

---

# 📚 Índice

1. Autenticación  
2. GET /api/v1/mails  
3. GET /api/v1/suggestions  
4. Errores comunes  
5. Notas de desarrollo  
6. Última actualización  

---

# 🔐 1. Autenticación

Todos los endpoints requieren un **Bearer token** de OAuth Google válido.

Ejemplo:

```bash
-H "Authorization: Bearer <ACCESS_TOKEN>"
````

Si el token expira, Gmail y Fastify devolverán errores de autorización.

---

# ✉️ 2. GET /api/v1/mails

> Devuelve la lista de correos base SIN procesar por IA.

### Descripción

Endpoint para obtener correos crudos desde Gmail.
Este endpoint NO llama a ML, NO genera sugerencias y NO aplica clasificación automática.

Este es el equivalente a “inbox real”.

### Request

```
GET /api/v1/mails
Authorization: Bearer <token>
```

### Response 200

```json
{
  "mails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Tu recibo de luz",
      "snippet": "Vence el 15 de noviembre...",
      "date": "2025-11-18T02:32:11.000Z"
    }
  ],
  "nextPageToken": "xyz...",
  "total": 25
}
```

### Notas

* Paginación depende de `nextPageToken`.
* Se usa Gmail API internamente.
* No hay sugerencias ni IA en este endpoint.

---

# 🤖 3. GET /api/v1/suggestions

> Devuelve correos enriquecidos CON IA (clasificación y sugerencias).

### Descripción

Este endpoint aplica inteligencia artificial sobre los correos.
Fastify obtiene los correos base → llama a `emailSuggester` → que delega en `mlClient` → que llama al microservicio ML en Python.

Resultado: correos con sugerencias automáticas.

### Request

```
GET /api/v1/suggestions
Authorization: Bearer <token>
```

### Respuesta 200 (ejemplo)

```json
{
  "emails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Tu recibo de luz",
      "snippet": "Vence el 15 de noviembre...",
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

### Caso ML caído o con error (timeout, 5xx, fallas de red)

La API NO truena.
Devuelve:

```json
{
  "emails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Tu recibo de luz",
      "snippet": "Vence el 15 de noviembre...",
      "date": "2025-11-18T02:32:11.000Z",
      "suggestions": []
    }
  ]
}
```

### Notas técnicas

* `suggestions` siempre es un arreglo.
* Fastify NO detiene la respuesta si ML falla.
* `emailSuggester` normaliza strings, números y objetos en formato uniforme.
* La lógica robusta está en:

  * `src/services/mlClient.js`
  * `src/services/emailSuggester.js`

---

# ⚠️ 4. Errores comunes

### 401 — Unauthorized

Token inválido o expirado.

### 503 — ML unavailable (solo interno, no al cliente)

Fastify captura este error y NO devuelve 503 al cliente.
En su lugar devuelve suggestions vacías.

### 422 — Validation error

Fastify devolverá error si payloads esperados no cumplen formato.

---

# 🧪 5. Pruebas asociadas

Rutas:

* `tests/mailsRoutes.test.js`
* `tests/suggestionsRoutes.test.js`

Servicios:

* `tests/mlClient.test.js`
* `tests/emailSuggester.test.js`

Todos los tests pasan en verde:

```
33 passed — 0 failed
```

---

# 🛠 6. Notas de desarrollo

* El backend usa ESM (import/export).
* Gmail API se accede mediante servicios internos.
* ML está desacoplado vía mlClient.
* No se exponen tokens en logs (seguridad obligatoria).
* Timeout configurable:

  ```
  ML_TIMEOUT_MS=5000
  ```
* URL configurable:

  ```
  ML_BASE_URL=http://localhost:8000
  ```

---

# 📅 Última actualización

Julio 2025
Equipo de Arquitectura (actualizado automáticamente por ChatGPT)

---

# FIN DEL ARCHIVO

```

---

```
