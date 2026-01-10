# 📬 Email Cleaner & Smart Notifications

> **Smart AI‑powered system to organize your Gmail inbox, declutter irrelevant emails, and notify you only when action is required.**

---

## 🌐 Overview

Email Cleaner & Smart Notifications automatically connects to your Gmail account using **OAuth 2.0**, classifies incoming messages via a **FastAPI ML microservice**, and orchestrates automation through **n8n flows** for Telegram or Slack alerts.

---

## 🧠 Architecture at a Glance

```mermaid
flowchart LR
    A["📥 Gmail API (OAuth2)"] --> B["⚙️ Fastify Backend (Node.js)"]
    B --> C["🔍 FastAPI Microservice (Python ML)"]
    C --> D["🗄️ PostgreSQL Persistence"]
    D --> E["🔔 n8n / Telegram Notifications"]
```

---

## ⚙️ Key Features

- **AI‑based classification** — Detects type and intent of each email.  
- **Priority Filtering** — Shows only messages that matter.  
- **Secure OAuth2 integration** — No stored passwords or IMAP usage.  
- **Automation Ready** — Easily connect rules to n8n workflows.  
- **Modular Architecture** — Node.js ↔ Python ↔ Cloud Run.  

---

## 🧭 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/gtovar/email-cleaner-fastify.git
   cd email-cleaner-fastify
   ```

2. Configure environment

cp .env.example .env

| Variable | Descripción | Obligatoria | Ejemplo |
|---|---|---:|---|
| DATABASE_URL | Cadena de conexión PostgreSQL | Sí | postgres://user:pass@localhost:5432/email_cleaner |
| GMAIL_CLIENT_ID | OAuth 2.0 Client ID | Sí | xxx.apps.googleusercontent.com |
| GMAIL_CLIENT_SECRET | OAuth 2.0 Client Secret | Sí | supersecret |
| GMAIL_REDIRECT_URI | Redirect (OAuth) | Sí | http://localhost:3000/oauth/google/callback |
|INTERNAL_JWT_SECRET| Inter-service / Security | No | xxxxx|
| ML_BASE_URL | URL del microservicio ML | Sí | http://localhost:8000 |
| PORT | Puerto del backend | Sí | 3000 |
| N8N_WEBHOOK_URL | Webhook para pruebas | No | http://localhost:5678/webhook/telegram-test |
| TELEGRAM_BOT_TOKEN | Telegram | No | xxxxx |

3. **Run locally** (Node/Fastify)
   ```bash
   npm install
   npm run dev # http://localhost:3000
   ```

4. **Run ML microservice** (Python/FastAPI)
   ```bash
   cd python/classifier
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000 # http://localhost:8000/docs
   ```

5. Database
npm run db:migrate
npm run db:seed (optional)
npm run db:rollback (optional)

Test (ML suggestions direct):
```bash
curl -X POST http://localhost:8000/v1/suggest \
  -H "Content-Type: application/json" \
  -d '[{"id":"e1","from":"invoices@cfe.mx","subject":"Your electricity bill is ready","date":"2025-11-18T02:32:11.000Z","isRead":false,"category":"promotions","attachmentSizeMb":12.4}]'
```

6. **Open API docs**
   - Fastify API → [http://localhost:3000/docs](http://localhost:3000/docs)  
   - FastAPI ML Service → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📚 Documentation Index

| Section | Description |
| -------- | ------------ |
| [🧠 Design Document](./DESIGN_DOCUMENT.md) | Technical architecture and key decisions |
| [📡 API Reference](./API_REFERENCE.md) | REST endpoints and examples |
| [⚡ Quickstart Guide](./TUTORIALS/QUICKSTART.md) | Run the project locally in minutes |
| [🗄️ Database Migrations](./migraciones.md) | Sequelize migration workflow |
| [🌱 Seeders Guide](./seeders.guia.md) | Load initial or reference data |
| [🚀 Deploy to Cloud Run](./despliegue-cloudrun.md) | Cloud Build + Cloud Run deployment steps |
| [🤝 Contribution Guide](https://github.com/gtovar/email-cleaner-fastify/blob/main/CONTRIBUTION.md) | Collaboration and commit standards |
| [📦 Events Contract](./events_contract.md) | Event names, payloads, semantics y consumers |
| [Documentation Rules](./documentation_rules.md) | Project-wide rules: canonical doc ownership, language/tone policy, and update protocols. |


---

## 🧰 Technology Stack

| Layer | Technology | Purpose |
| ----- | ----------- | -------- |
| **Frontend** | React + Vite | Dashboard and user control panel |
| **Backend API** | Fastify (Node.js) | Core business logic + REST services |
| **ML Microservice** | FastAPI (Python) | NLP classification engine |
| **Database** | PostgreSQL | Structured data storage |
| **Infrastructure** | Docker + Cloud Run | Reproducible and scalable deployments |

---

## 🧾 Maintainers

Maintained by **Gilberto Tovar**  
📧 contacto@gilbertotovar.com       
🌐 [www.gilbertotovar.com](https://www.gilbertotovar.com)

---

**Last updated:** November 2025 — Architecture Team  
