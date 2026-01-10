# Quickstart — Email Cleaner & Smart Notifications
Fast and simple guide to run the entire system locally.

---

## 1. Requirements

- Node.js 18+
- Python 3.10+
- pip + venv
- Uvicorn
- Docker (optional, recommended)
- Google OAuth2 credentials (Client ID, Secret, Redirect URI)

---

## 2. Install Dependencies

### Backend (Fastify)
```bash
cd email-cleaner-fastify
npm install
```

### ML Service (FastAPI)
```bash
cd email-cleaner-fastify/python/classifier
pip install -r requirements.txt
```

### Frontend (React)
```bash
cd email-cleaner-react
npm install
```

---

## 3. Environment Variables

Each module includes a `.env.example`. Copy it to `.env`:

```bash
cp .env.example .env
```

Important variables for the backend:

```env
ML_BASE_URL=http://localhost:8000
ML_TIMEOUT_MS=5000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
```

---

## 4. Run in Development Mode

### A) Fastify Backend
```bash
cd email-cleaner-fastify
npm run dev
```

Available at:
```
http://localhost:3000
```

### B) FastAPI ML Service
```bash
cd email-cleaner-fasitfy/python
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Available at:
```
http://localhost:8000
```

### C) React Frontend
```bash
cd email-cleaner-react
npm run dev
```

Available at:
```
http://localhost:5173
```

---

## 5. Run with Docker (Recommended)

```bash
cd ops
docker compose -f docker-compose.yml up --build
```

This starts:
- Postgres
- Fastify Backend
- FastAPI ML
- React Frontend

---

## 6. Authentication (Google OAuth)

Use your Gmail OAuth `access_token` in the headers:

```bash
-H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 7. Test the API

### Base Email List (no AI)
```bash
curl -H "Authorization: Bearer <TOKEN>"      http://localhost:3000/api/v1/emails
```

### Email List with AI Suggestions
```bash
curl -H "Authorization: Bearer <TOKEN>"      http://localhost:3000/api/v1/suggestions
```

Example response:
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

If ML is offline, backend returns suggestions as empty:
```json
{ "emails": [ { "id": "...", "suggestions": [] } ] }
```

---

## 8. Run Tests

### Backend (Jest)
```bash
cd email-cleaner-fastify
npm test
```

Expected:
```
40 passed, 0 failed
```

### ML (pytest)
```bash
cd email-cleaner-fastify/python/classifier
pytest
```

---

## 9. Smoke Test

### Backend health:
```bash
curl http://localhost:3000/api/v1/health
```

### ML docs:
```bash
curl http://localhost:8000/docs
```

### Suggestions:
```bash
curl -H "Authorization: Bearer <TOKEN>"      http://localhost:3000/api/v1/suggestions
```

---

## 10. Main Endpoints

- `/api/v1/emails`
- `/api/v1/suggestions`
- `/health`
- `http://localhost:8000/docs` (ML OpenAPI)

---

# END OF FILE
