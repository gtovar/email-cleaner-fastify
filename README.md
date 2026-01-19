Full documentation: https://gtovar.github.io/email-cleaner-fastify/

# Email Cleaner & Smart Notifications

[![Docs](https://img.shields.io/badge/docs-MkDocs%20Material-brightgreen)](https://gtovar.github.io/email-cleaner-fastify/)
[![Pages](https://github.com/gtovar/email-cleaner-fastify/actions/workflows/docs.yml/badge.svg)](../../actions/workflows/docs.yml)

System that classifies emails, prioritizes what matters, and alerts when action is needed.
Built with **Fastify (Node.js)** for backend logic, **FastAPI (Python)** for ML, and **n8n** for automation.

---

## Overview

This system connects securely to Gmail, classifies messages with ML models, and filters what requires attention.

---

## Core Features

- **Classification** — NLP-based categorization of incoming emails.
- **Priority notifications** — Alerts for messages that match configured criteria.
- **Gmail integration** — OAuth2-based secure connection.
- **Multi-service architecture** — Node.js backend + Python ML microservice.
- **Automation** — n8n workflows for Telegram or Slack notifications.

---

## Architecture Overview

| Layer           | Technology         | Purpose                          |
| --------------- | ------------------ | -------------------------------- |
| Frontend        | React + Vite       | Web interface and control panel  |
| Backend API     | Fastify (Node.js)  | Business logic and orchestration |
| ML Microservice | FastAPI (Python)   | Email classification engine      |
| Database        | PostgreSQL         | Data persistence                 |
| Infrastructure  | Docker + Cloud Run | Deployment and scalability       |

---

## Setup Instructions

> Requirements: Node.js ≥ 20, Python ≥ 3.10, Docker (optional).

### 1) Clone the repository

```bash
git clone https://github.com/gtovar/email-cleaner-fastify.git
cd email-cleaner-fastify
```

### 2) Environment setup

```bash
cp .env.example .env
```

### 3) Install dependencies

**Backend:**
```bash
npm install
```

**ML microservice:**
```bash
cd python/classifier
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4) Run the services

**Fastify backend:**
```bash
npm run dev
# http://localhost:3000
```

**Python classifier (FastAPI):**
```bash
uvicorn main:app --reload --port 8000
# http://localhost:8000/docs
```

### 5) Database

```bash
npm run db:migrate
npm run db:seed      # optional
npm run db:rollback  # optional
```

### 6) Docker (local)

```bash
docker compose -f ops/docker-compose.yml up --build
```

### Smoke test

```bash
curl -s http://localhost:3000/api/v1/health/db
```

---

## Run tests

This project uses Jest.

```bash
npm test         # Run all tests once
npm run test:watch # Watch mode
npm run coverage   # Coverage report in ./coverage
```

---

## Repository layout

- src/                    # Fastify app (API v1)
- python/classifier/      # FastAPI microservice (ML)
- migrations/             # Sequelize migrations & seeds
- ops/
  └─ docker-compose.yml   # Local orchestration (DB, n8n, Fastify, FastAPI)
- docs/                   # Documentation source (MkDocs)
- .github/workflows/      # CI/CD (GitHub Actions)
- README.md               # Main guide (source of truth with docs/)

---

### Environment variables

| Variable | Description | Required | Example |
|---|---|---:|---|
| DATABASE_URL | PostgreSQL connection string | Yes | postgres://user:pass@localhost:5432/email_cleaner |
| DB_HOST | DB host | No* | 127.0.0.1 |
| DB_PORT | DB port | No* | 5432 |
| DB_USERNAME | DB user | No* | postgres |
| DB_PASSWORD | DB password | No* | secret |
| DB_DATABASE | DB name | No* | email_cleaner |
| GOOGLE_CLIENT_ID | OAuth 2.0 Client ID | Yes | xxx.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | OAuth 2.0 Client Secret | Yes | supersecret |
| GOOGLE_REDIRECT_URI | OAuth redirect | Yes | http://localhost:3000/auth/google/callback |
| FRONTEND_ORIGIN | Frontend origin | Yes | http://localhost:5173 |
| INTERNAL_JWT_SECRET | Inter-service / security | No | xxxxx |
| TOKEN_ENCRYPTION_KEY | Encrypt OAuth tokens at rest (base64 32 bytes) | Yes | base64-32-bytes |
| ML_BASE_URL | ML microservice URL | Yes | http://localhost:8000 |
| PORT | Backend port | Yes | 3000 |
| PORT_HTTP | HTTP port | No | 3001 |
| PORT_HTTPS | HTTPS port | No | 3000 |
| TLS_CERT_PATH | TLS certificate path (HTTPS) | No | /path/to/cert.pem |
| TLS_KEY_PATH | TLS key path (HTTPS) | No | /path/to/key.pem |
| N8N_WEBHOOK_URL | Webhook for tests | No | http://localhost:5678/webhook/telegram-test |
| TELEGRAM_BOT_TOKEN | Telegram | No | xxxxx |

> *Use `DATABASE_URL` or `DB_*`, not both.

### Auth note

Gmail endpoints (`/api/v1/emails`, `/api/v1/suggestions`) require a valid session:
- cookie `session_token`, or
- `Authorization: Bearer <SESSION_TOKEN>` for API tools.

---

## API reference

The API documentation is generated from code and available at `/docs` when the server is running.

---

### OAuth modes

- `OAUTH_MODE=mock` → documented only (not implemented in code yet).
- `OAUTH_MODE=google` → requires GCP OAuth setup (see `docs/operations/oauth-google.md`).
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI` (e.g., `http://localhost:3000/auth/google/callback`)

---

## Testing the ML pipeline (direct ML service)

```bash
curl -X POST http://localhost:8000/v1/suggest \
  -H "Content-Type: application/json" \
  -d '[{"id":"e1","from":"invoices@cfe.mx","subject":"Your electricity bill is ready","date":"2025-11-18T02:32:11.000Z","isRead":false,"category":"promotions","attachmentSizeMb":12.4}]'
```

Expected result:
```json
[
  {
    "id": "e1",
    "from": "invoices@cfe.mx",
    "subject": "Your electricity bill is ready",
    "date": "2025-11-18T02:32:11.000Z",
    "isRead": false,
    "category": "promotions",
    "attachmentSizeMb": 12.4,
    "suggestions": [
      {
        "action": "move",
        "classification": "large_attachments_old",
        "confidence_score": 0.8
      }
    ]
  }
]
```

**Trigger notification test:**
```bash
curl -X POST http://localhost:5678/webhook/telegram-test
```

---

## Related documentation

| File | Description |
| --- | --- |
| [DESIGN_DOCUMENT.md](docs/DESIGN_DOCUMENT.md) | Technical architecture and key decisions |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | REST endpoints and examples |
| [architecture.md](docs/architecture.md) | System data-flow diagram |
| [despliegue-cloudrun.md](docs/despliegue-cloudrun.md) | Cloud Run deployment guide |
| [migraciones.md](docs/migraciones.md) | Sequelize migration workflow |
| [seeders.guia.md](docs/seeders.guia.md) | Seeders guide |

Full documentation: https://gtovar.github.io/email-cleaner-fastify/

---

## Tech Stack Summary

- **Backend:** Node.js (Fastify), PostgreSQL
- **ML Service:** Python (FastAPI, scikit-learn)
- **Infra:** Docker, Cloud Run, Secret Manager
- **Notifications:** n8n + Telegram integration
- **CI:** GitHub Actions (lint + test). Docs deploy via GitHub Pages.

---

## Maintainers

Maintained by **Gilberto Tovar**
- Email: contacto@gilbertotovar.com
- Web: https://www.gilbertotovar.com

---

**Last updated: January 2026
