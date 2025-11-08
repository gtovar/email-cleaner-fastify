# 🚀 Deployment Guide — Google Cloud Run

This document describes how to package and deploy **Email Cleaner & Smart Notifications** to **Google Cloud Run** following the official architecture and code‑style guidelines.

---

## 🎯 Objective

- Ensure **secure and reproducible** deployments.  
- Minimize time‑to‑production through automated CI/CD.  
- Protect secrets and environment variables via **Secret Manager**.

---

## 🧩 1. Prerequisites

| Resource                 | Version / Requirement                           | Notes                                              |
| ------------------------ | ----------------------------------------------- | -------------------------------------------------- |
| **gcloud CLI**           | ≥ 475                                           | Install via `brew install --cask google-cloud-sdk` |
| **Google Cloud Project** | Billing + Cloud Run + Artifact Registry enabled | Use same project as OAuth2 credentials             |
| **Docker**               | ≥ 24                                            | For local builds                                   |
| **PostgreSQL**           | Cloud SQL or external                           | Recommended: Cloud SQL with VPC‑SC                 |
| **.env.prod**            | Encrypted variables                             | See section 4                                      |

---

## 📁 2. Directory Structure

```plaintext
email-cleaner/
├── Dockerfile
├── cloudbuild.yaml        # optional CI/CD pipeline
└── src/
```

---

## ⚙️ 3. Reference Dockerfile

```dockerfile
# Stage 1 – build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Stage 2 – runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/index.js"]
```

**Rationale:** Multi‑stage builds produce lightweight images with faster startup.

---

## 🔐 4. Environment Variables (`.env.prod`)

| Variable               | Example / Notes               |
| ---------------------- | ----------------------------- |
| `PORT`                 | 8080 (automatically injected) |
| `GOOGLE_CLIENT_ID`     | Stored in Secret Manager      |
| `GOOGLE_CLIENT_SECRET` | Same as above                 |
| `DB_HOST`              | `/cloudsql/<CONN_NAME>`       |
| `DB_USERNAME`          | DB user                       |
| `DB_PASSWORD`          | Stored in Secret Manager      |

Use **Secret Manager** references at runtime via `--set-secrets`.

---

## 🧰 5. Manual Deployment

```bash
gcloud init
gcloud auth application-default login
gcloud services enable run.googleapis.com artifactregistry.googleapis.com sqladmin.googleapis.com
gcloud config set project email-cleaner-463600
gcloud config set run/region us-central1

gcloud builds submit --tag us-central1-docker.pkg.dev/email-cleaner-463600/email-cleaner/email-cleaner:$(git rev-parse --short HEAD)

gcloud run deploy email-cleaner   --image us-central1-docker.pkg.dev/email-cleaner-463600/email-cleaner/email-cleaner:$(git rev-parse --short HEAD)   --platform managed   --allow-unauthenticated=false   --add-cloudsql-instances email-cleaner-463600:us-central1:pg-instance   --set-env-vars NODE_ENV=production   --set-secrets GOOGLE_CLIENT_SECRET=projects/123/secrets/GOOGLE_CLIENT_SECRET:latest   --memory 512Mi --cpu 1 --max-instances 3
```

**Notes:**  
- `--allow-unauthenticated=false` → IAM authentication required.  
- `--add-cloudsql-instances` → mounts Cloud SQL socket.  
- Adjust CPU/memory per cost/performance needs.

---

## ⚙️ 6. CI/CD — `cloudbuild.yaml`

```yaml
steps:
  - id: Build & Push
    name: gcr.io/cloud-builders/docker
    args: ["build","-t","$LOCATION-docker.pkg.dev/$PROJECT_ID/email-cleaner/email-cleaner:$SHORT_SHA","."]
  - id: Deploy
    name: gcr.io/google.com/cloudsdktool/cloud-sdk
    entrypoint: gcloud
    args:
      ["run","deploy","email-cleaner","--image","$LOCATION-docker.pkg.dev/$PROJECT_ID/email-cleaner/email-cleaner:$SHORT_SHA","--platform","managed","--region","$LOCATION","--quiet"]
images:
  - "$LOCATION-docker.pkg.dev/$PROJECT_ID/email-cleaner/email-cleaner:$SHORT_SHA"
```

Automatically triggers on each push to `main`.

---

## 📊 7. Observability

- **Logs:** Cloud Logging (`service=email-cleaner`)  
- **Metrics:** Cloud Monitoring (alerts: CPU > 80%, latency p95)  
- **Tracing:** Cloud Trace for TTFB and request paths  

---

## 🔁 8. Quick Rollback

```bash
gcloud run revisions list --service email-cleaner
gcloud run services update-traffic email-cleaner --to-revisions REVISION@latest=0,REVISION@prev=100
```

Redirects 100% of traffic to the previous revision (blue‑green rollback).

---

## 🔒 9. Security Best Practices

1. Use least‑privilege service accounts.  
2. Store secrets only in Secret Manager.  
3. Enable VPC‑SC for sensitive data.  
4. Use Cloud SQL IAM Auth instead of static passwords.  
5. Retain logs ≥ 30 days.  

---

## ✅ 10. Summary

1. Multi‑stage Dockerfile.  
2. `.env.prod` managed via Secret Manager.  
3. Enable required services and publish to Artifact Registry.  
4. Deploy via `gcloud builds submit` + `gcloud run deploy`.  
5. Monitor and rollback when needed.  

---

**Last updated:** July 2025 — Architecture Team  