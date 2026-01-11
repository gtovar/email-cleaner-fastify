# 🧠 Design & Architecture Document  
### Project: Email Cleaner & Smart Notifications  
> “Designed to understand your inbox — and declutter your mind.”

---

## 1. 🧭 System Vision and Context

### 1.1 Problem
Modern inboxes cause **information overload and cognitive fatigue**, forcing users to waste time filtering irrelevant messages instead of focusing on real work.

### 1.2 Proposed Solution
A platform that **automatically organizes and prioritizes emails** using AI, securely integrates with Gmail, and alerts users only when truly relevant messages arrive.

The system combines **Fastify (Node.js)** for high‑performance I/O, **FastAPI (Python)** for ML‑based classification, and **n8n** as a notification orchestrator.

---

## 2. 🧩 System Architecture

### 2.1 Technology Stack

| Layer           | Technology         | Purpose                                |
| --------------- | ------------------ | -------------------------------------- |
| Frontend        | React + Vite       | User dashboard and visualization       |
| Backend API     | Fastify (Node.js)  | Core business logic and routing        |
| ML Microservice | FastAPI (Python)   | Email classification model             |
| Infrastructure  | Docker + Terraform | Consistent and reproducible deployment |

### 2.2 Design Principles

1. **Single Responsibility Principle (SRP)**  
   Each component has a single, well‑defined purpose.  
2. **Modular Scalability**  
   Plugin‑based architecture with isolated services.  
3. **Interoperability**  
   Communication between Node.js ↔ Python via REST.  
4. **Security First**  
   Encrypted OAuth2 tokens; no credential storage.

---

## 3. ⚙️ Critical Data Flow — Email Classification

**Objective:** Automatically process, classify, and label incoming emails.

### Pipeline Stages

1. **Start:** Gmail API fetches new emails via OAuth2.  
2. **Pre‑Processing:** Fastify normalizes payloads and builds JSON structure.  
3. **POST Request:** Backend sends the payload to the ML service.  
4. **Classification:** FastAPI applies the ML model and returns **classification** + action.  
5. **End:** Fastify saves the result in PostgreSQL and triggers n8n notifications.

*(See `architecture.md` for the corresponding Mermaid flow diagram.)*

---

## 4. 🧠 Key Design Decisions

### 4.1 Why Fastify Instead of Express
Fastify’s plugin system and performance allow cleaner modularization, lower latency, and simpler dependency injection.

### 4.2 Separate ML Microservice
Keeping ML logic in a standalone Python service allows independent scaling, optimized libraries (e.g., scikit‑learn), and easier updates without redeploying the backend.

### 4.3 n8n for Automation
n8n simplifies integration pipelines and event‑based notifications with no additional backend code.

---

## 5. 📂 Backend Directory Layout (Fastify)

```
src/
├── commands/         
├── queries/         
├── events/         
├── plugins/          # Dependency registration (DB, Gmail, etc.)
├── services/         # Business logic and rules
├── routes/           # REST endpoints
├── controllers/      # Request orchestrators
├── utils/            # Shared helpers
└── app.js            # Main entry point
```

Pattern: **“Controller → Service → Command → EventBus → Listener → Command → DB”.**
Benefit: scalable, testable, and easily extendable structure.

---

## 6. 🔐 Security and Authentication

- OAuth2 with Gmail (read‑only scope).  
- AES‑256 encryption for secrets.  
- Role‑scoped permissions (read / write).  
- Schema validation with AJV.  

---

## 7. 📈 Scalability and Performance

- **Fastify:** efficient concurrency with minimal overhead.  
- **Cloud Run autoscaling:** handles traffic bursts.  
- **Redis (optional):** caching for frequent rule sets.  
- **Cloud SQL (PostgreSQL):** managed and secure database.

---

## 8. 🧪 Testing & CI/CD

- **Jest:** Node.js unit tests.  
- **Pytest:** ML service testing.  
- **GitHub Actions / Cloud Build:** automated CI/CD pipeline.  
- **ESLint + Prettier:** enforce code quality and formatting.

---

## 9. 🚀 Deployment Environments

| Environment | Purpose      | Infrastructure                         |
| ----------- | ------------ | -------------------------------------- |
| Local       | Development  | Docker Compose                         |
| Staging     | QA / Testing | Cloud Run + Temporary DB               |
| Production  | End users    | Cloud Run + Cloud SQL + Secret Manager |

---

## 10. 📚 Related Documentation

- `API_REFERENCE.md` — REST API reference  
- `despliegue-cloudrun.md` — Cloud Run deployment guide  
- `architecture.md` — System data‑flow diagram  

---

**Last updated:** July 2025  
**Author:** Gilberto Tovar — Technical Architecture & Design  
