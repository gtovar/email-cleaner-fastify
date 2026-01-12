# Quickstart — Email Cleaner & Smart Notifications
Fast and simple guide to run the entire system locally.

---

## 1) Requirements

- Node.js 18+
- Python 3.10+
- pip + venv
- Uvicorn
- Docker (optional, recommended)
- Google OAuth credentials (Client ID, Secret, Redirect URI)

---

## 2) Install dependencies

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

## 3) Environment variables

Each module includes a `.env.example`. Copy it to `.env`:

```bash
cp .env.example .env
```

Important backend variables:

```env
ML_BASE_URL=http://localhost:8000
ML_TIMEOUT_MS=5000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
FRONTEND_ORIGIN=http://localhost:5173
```

---

## 4) Run in development mode

### A) Fastify backend
```bash
cd email-cleaner-fastify
npm run dev
```

Available at:
```
http://localhost:3000
```

### B) FastAPI ML service
```bash
cd email-cleaner-fastify/python/classifier
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Available at:
```
http://localhost:8000
```

### C) React frontend
```bash
cd email-cleaner-react
npm run dev
```

Available at:
```
http://localhost:5173
```

---

## 5) Run with Docker (recommended)

```bash
cd ops
docker compose -f docker-compose.yml up --build
```

This starts:
- Postgres
- Fastify backend
- FastAPI ML
- React frontend

---

## 6) Authentication (Google OAuth)

Use the browser flow:
- Visit `GET /auth/google`
- Complete OAuth consent
- Backend sets `session_token` cookie and redirects to `${FRONTEND_ORIGIN}/auth/callback`

API tools can send the session JWT as:
```
Authorization: Bearer <SESSION_TOKEN>
```

---

## 7) Test the API

### Base email list (no AI)
```bash
curl -H "Authorization: Bearer <SESSION_TOKEN>" \
  http://localhost:3000/api/v1/emails
```

### Email list with AI suggestions
```bash
curl -H "Authorization: Bearer <SESSION_TOKEN>" \
  http://localhost:3000/api/v1/suggestions
```

---

## 8) Run tests

### Backend (Jest)
```bash
cd email-cleaner-fastify
npm test
```

### ML (pytest)
```bash
cd email-cleaner-fastify/python/classifier
pytest
```

---

## 9) Smoke test

### Backend health:
```bash
curl http://localhost:3000/api/v1/health
```

### ML docs:
```bash
curl http://localhost:8000/docs
```

---

## 10) Main endpoints

- `/api/v1/emails`
- `/api/v1/suggestions`
- `/api/v1/notifications/summary`
- `/api/v1/notifications/history`
- `/api/v1/notifications/confirm`
- `/api/v1/health`
