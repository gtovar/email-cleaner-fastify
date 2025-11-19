````txt
# ⚡ Quickstart — Email Cleaner & Smart Notifications
> Guía rápida para levantar y probar el proyecto  
> Actualizado tras la corrección de HU12 (Fastify ↔ ML)

---

# 🚀 Objetivo del Quickstart
Levantar el backend Fastify y el microservicio ML (FastAPI), obtener un token de Gmail, probar los endpoints reales y validar que la integración funciona.

Este documento te permite levantar todo el sistema en minutos.

---

# 🧩 Requisitos previos

- Node.js 18+  
- Python 3.10+  
- Gmail OAuth configurado  
- Uvicorn instalado (para FastAPI)
- npm o yarn
- Postman / Curl opcional

---

# 📦 1. Instalar dependencias

## Fastify backend
```bash
npm install
````

## Microservicio ML (Python)

```bash
cd python/classifier
pip install -r requirements.txt
```

---

# ⚙️ 2. Variables de entorno

Crea un archivo `.env` en el raíz del proyecto:

```env
# Config ML
ML_BASE_URL=http://localhost:8000
ML_TIMEOUT_MS=5000

# (Opcional) URL para Docker
FASTAPI_URL=http://fastapi:8000
```

> Nota: FASTAPI_URL es usada en escenarios Docker;
> ML_BASE_URL es usada localmente por mlClient.

---

# 🟢 3. Levantar Fastify

```bash
npm run dev
```

Escuchando en:

```
http://localhost:3000
```

---

# 🔵 4. Levantar el microservicio ML (FastAPI)

```bash
cd python/classifier
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Escuchando en:

```
http://localhost:8000
```

---

# 🔐 5. Obtener token de Gmail

Este proyecto usa OAuth2 de Google.

Pasos:

1. En navegador, autentícate con Gmail.
2. Copia el access_token.
3. Úsalo en headers como:

```bash
-H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

# 📬 6. Probar endpoints reales

## 🔸 Prueba: obtener correos base (sin IA)

```bash
curl -X GET "http://localhost:3000/api/v1/mails" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Respuesta esperada:

```json
{
  "mails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Tu recibo de luz",
      "snippet": "Vence el 15 de noviembre...",
      "date": "2025-11-18T02:32:11Z"
    }
  ],
  "nextPageToken": null,
  "total": 1
}
```

---

## 🔸 Prueba: obtener correos con IA (sugerencias)

```bash
curl -X GET "http://localhost:3000/api/v1/suggestions" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Respuesta esperada:

```json
{
  "emails": [
    {
      "id": "18c8f6e...",
      "from": "facturas@cfe.mx",
      "subject": "Tu recibo de luz",
      "snippet": "Vence el 15 de noviembre...",
      "date": "2025-11-18T02:32:11Z",
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

### Caso ML caído

```json
{
  "emails": [
    {
      "id": "...",
      "suggestions": []
    }
  ]
}
```

> El backend nunca truena si el ML falla.
> Simplemente devuelve `suggestions: []`.

---

# 🧪 7. Probar todo el pipeline

### Pipeline completo:

```bash
npm test
```

Resultados esperados:

```
33 passed, 0 failed
```

Esto asegura:

* mlClient funciona (errores, timeout, URL)
* emailSuggester funciona (normalización + fallback)
* suggestionsRoutes funciona
* mailsRoutes funciona

---

# 🛠 8. Notas importantes para desarrollo

* `/api/v1/mails` → Gmail base
* `/api/v1/suggestions` → Gmail base + IA
* No usar `/api/v1/emails` (endpoint eliminado)
* Fastify usa ESM
* ML usa FastAPI con JSON puro
* Las sugerencias siempre se normalizan a objetos `{ action, reason? }`

---

# 🧭 9. Siguiente paso recomendado (HU6)

* Implementar UI real de sugerencias en React
* Consumir `/suggestions` desde frontend
* Mostrar acciones sugeridas
* Preparar endpoints futuros para accionamientos reales
  (archivar, eliminar, marcar leído)

---

# FIN DEL ARCHIVO

```

---

```

