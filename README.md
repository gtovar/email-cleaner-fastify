📘 Full docs: https://gtovar.github.io/email-cleaner-fastify/

# 🧩 Email Cleaner & Smart Notifications

[![Docs](https://img.shields.io/badge/docs-MkDocs%20Material-brightgreen)](https://gtovar.github.io/email-cleaner-fastify/)
[![Pages](https://github.com/gtovar/email-cleaner-fastify/actions/workflows/docs.yml/badge.svg)](../../actions/workflows/docs.yml)


An intelligent system that automatically classifies your emails, prioritizes what truly matters, and alerts you when action is needed.  
Built with **Fastify (Node.js)** for backend logic, **FastAPI (Python)** for machine learning, and **n8n** for smart automation.

---

## 🚀 Overview

Managing dozens of emails daily can easily lead to **decision fatigue** and **loss of focus**.  
This system connects securely to Gmail, classifies messages with ML models, and filters what deserves your attention.

---

## 🧠 Core Features

- **Smart Classification** — NLP-based categorization of incoming emails.  
- **Priority Notifications** — Only alerts you for messages that matter.  
- **Seamless Gmail Integration** — OAuth2-based secure connection.  
- **Multi-service Architecture** — Node.js backend + Python ML microservice.  
- **Automation-ready** — n8n workflows for Telegram or Slack notifications.

---

## 🧱 Architecture Overview

| Layer           | Technology         | Purpose                          |
| --------------- | ------------------ | -------------------------------- |
| Frontend        | React + Vite       | Web interface and control panel  |
| Backend API     | Fastify (Node.js)  | Business logic and orchestration |
| ML Microservice | FastAPI (Python)   | Email classification engine      |
| Database        | PostgreSQL         | Data persistence                 |
| Infrastructure  | Docker + Cloud Run | Deployment and scalability       |

---

## ⚙️ Setup Instructions

> ⚠️ **Requirements:** Node.js ≥ 20.0  •  Python ≥ 3.10  •  Docker (optional)  
> Ensure you have both environments active before running the backend and ML microservice.

### 1. Clone the Repository

```bash
git clone https://github.com/gtovar/email-cleaner-fastify.git
cd email-cleaner-fastify
```

### 2. Environment Setup

Copy the environment example and fill in your Gmail credentials:

```bash
cp .env.example .env
```

### 3. Install Dependencies

**Backend:**
```bash
npm install
```

**ML Microservice:**
```bash
cd python/classifier
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Run the Services

**Fastify Backend:**
```bash
npm run dev
# http://localhost:3000
```

**Python Classifier (FastAPI):**
```bash
uvicorn main:app --reload --port 8000
# http://localhost:8000/docs
```

### 5. Database
```bash
npm run db:migrate
npm run db:seed      # opcional
# rollback:
npm run db:rollback  # opcional
```

### 6. Docker (local)

```bash
  docker compose -f ops/docker-compose.yml up --build
```

### Smoke test
```bash
curl -s http://localhost:3000/api/v1/health/db
curl -s http://localhost:3000/api/v1/notifications/summary -H "Authorization: Bearer dummy"
curl -s http://localhost:3000/api/v1/notifications/history -H "Authorization: Bearer dummy"
```

## 🧪 Ejecutar pruebas

Este proyecto usa [Jest](https://jestjs.io/) como test runner principal.

Comandos disponibles:

```bash
npm test         # Ejecuta la suite una sola vez
npm run test:watch # Modo interactivo de Jest
npm run coverage   # Reporte de cobertura en ./coverage
```
> Jest se ejecuta en modo ESM con `NODE_OPTIONS=--experimental-vm-modules` para mantener la compatibilidad con `type: "module"`.
> Nota: el script de npm test ya incluye las opciones necesarias para ejecutar Jest con módulos ECMAScript en Node, por lo que no necesitas exportar variables extra manualmente.

## Repository layout

- src/                    # Fastify app (API v1)
- python/classifier/      # FastAPI microservice (ML)
- migrations/             # Sequelize migrations & seeds
- ops/
  └─ docker-compose.yml   # Orquestación local (DB, n8n, Fastify, FastAPI)
- docs/                   # Fuente de la documentación (MkDocs)
- .github/workflows/      # CI/CD (GitHub Actions)
- README.md               # Guía principal (fuente de verdad junto con docs/)

### Environment variables
| Variable | Descripción | Obligatoria | Ejemplo |
|---|---|---:|---|
| DATABASE_URL | Cadena de conexión PostgreSQL | Sí | postgres://user:pass@localhost:5432/email_cleaner |
| DB_HOST | Host de la base | No* | 127.0.0.1 |
| DB_PORT | Puerto DB | No* | 5432 |
| DB_USERNAME | Usuario DB | No* | postgres |
| DB_PASSWORD | Password DB | No* | secret |
| DB_DATABASE | Nombre DB | No* | email_cleaner |
| GOOGLE_CLIENT_ID | OAuth 2.0 Client ID | Sí | xxx.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | OAuth 2.0 Client Secret | Sí | supersecret |
| GOOGLE_REDIRECT_URI | Redirect (OAuth) | Sí | http://localhost:3000/oauth/google/callback |
| INTERNAL_JWT_SECRET| Inter-service / Security | No | xxxxx|
| ML_BASE_URL | URL del microservicio ML | Sí | http://localhost:8000 |
| PORT | Puerto del backend | Sí | 3000 |
| N8N_WEBHOOK_URL | Webhook para pruebas | No | http://localhost:5678/webhook/telegram-test |
| TELEGRAM_BOT_TOKEN | Telegram | No | xxxxx |

> *Usa `DATABASE_URL` o los `DB_*`. No ambos a la vez.
⚠️ Los endpoints que consultan Gmail (`/api/v1/emails`, `/api/v1/suggestions`) requieren un token Google válido.
Para probar sin OAuth real, use el flujo de **Notificaciones** con un token dummy (`Authorization: Bearer dummy`).

## 🧠 Especificación oficial de la API
La documentación de la API se genera directamente desde el código (esquemas definidos en las rutas y en `src/index.js`) y se muestra en **/docs** al ejecutar el servidor.

---

### OAuth modes
- `OAUTH_MODE=mock` → flujo simulado (recomendado si aun no tienes configurado GCP OAuth)
- `OAUTH_MODE=google` → requiere configurar GCP OAuth (ver docs/operations/oauth-google.md).
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI` (p. ej., `http://localhost:3000/oauth/google/callback`)
  - Pasos detallados: ver `docs/operations/oauth-google.md`.

> Nota: El modo `mock` se implementará en una iteración futura. Por ahora solo se documenta el comportamiento deseado para asegurar reproducibilidad en local sin secretos.


## 🧪 Testing the Pipeline

To test ML suggestions end-to-end (direct ML service):

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
Tests Telegram notification webhook from n8n flow.

```bash
curl -X POST http://localhost:5678/webhook/telegram-test
```

---

## 📦 Related Documentation

| File                     | Description                           |
| ------------------------ | ------------------------------------- |
| [Design Document.md](docs//DESIGN_DOCUMENT.md) | Technical architecture and key decisions |
| [API Reference.md](docs/API_REFERENCE.md) | REST endpoints and examples |
| [architecture.md](docs/architecture.md) | REST endpoints and examples |
| [despliegue-cloudrun.md](docs/despliegue-cloudrun.md) | Deployment guide for Google Cloud Run | 
| [migraciones.md](docs/migraciones.md) | Sequelize migration workflow |
| [seeders.guia.md](docs/seeders.guia.md) | Load initial or reference data |

📘 **Full documentation:** [https://gtovar.github.io/email-cleaner-fastify/](https://gtovar.github.io/email-cleaner-fastify/)

---

## 🧰 Tech Stack Summary

- **Backend:** Node.js (Fastify), PostgreSQL  
- **ML Service:** Python (FastAPI, scikit‑learn)  
- **Infra:** Docker, Cloud Run, Secret Manager  
- **Notifications:** n8n + Telegram integration  
- **CI/CD:** GitHub Actions (build + deploy + lint)  
- **Monitoring:** ELK Stack / Prometheus (optional phase 4)

---

## 🧾 Maintainers

Maintained by **Gilberto Tovar**  
📧 contacto@gilbertotovar.com  
🌐 [www.gilbertotovar.com](https://www.gilbertotovar.com)

---

## 🧩 Developer Tools

**pre-commit hook:** updates the "Last updated" footer automatically.

```bash
sed -i "s/Last updated:.*/Last updated: $(date '+%B %Y')/" README.md
```

---

**Last updated:** March 2026
