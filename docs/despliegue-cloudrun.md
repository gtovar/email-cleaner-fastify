# Deployment Guide — Google Cloud Run

This document describes how to package and deploy **Email Cleaner & Smart Notifications** to **Google Cloud Run**.

---

## Objective

- Ensure secure and reproducible deployments.
- Minimize time-to-production through automated CI/CD.
- Protect secrets and environment variables via **Secret Manager**.

---

## 1) Prerequisites

| Resource | Version / Requirement | Notes |
| --- | --- | --- |
| **gcloud CLI** | ≥ 475 | Install via `brew install --cask google-cloud-sdk` |
| **Google Cloud Project** | Billing + Cloud Run + Artifact Registry enabled | Use the same project as OAuth credentials |
| **Docker** | ≥ 24 | For local builds |
| **PostgreSQL** | Cloud SQL or external | Recommended: Cloud SQL with VPC-SC |
| **.env.prod** | Encrypted variables | See section 4 |

---

## 2) Directory structure

```plaintext
email-cleaner/
├── Dockerfile
├── cloudbuild.yaml        # optional CI/CD pipeline
└── src/
```

---

## 3) Reference Dockerfile

```dockerfile
# Stage 1 — build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Stage 2 — runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/index.js"]
```

---

## 4) Environment variables (.env.prod)

| Variable | Example / Notes |
| --- | --- |
| `PORT` | 8080 (injected by Cloud Run) |
| `GOOGLE_CLIENT_ID` | Stored in Secret Manager |
| `GOOGLE_CLIENT_SECRET` | Stored in Secret Manager |
| `DB_HOST` | `/cloudsql/<CONN_NAME>` |
| `DB_USERNAME` | DB user |
| `DB_PASSWORD` | Stored in Secret Manager |

Use Secret Manager references at runtime via `--set-secrets`.

---

## 5) Manual deployment

```bash
gcloud init
gcloud auth application-default login
gcloud services enable run.googleapis.com artifactregistry.googleapis.com sqladmin.googleapis.com
gcloud config set project email-cleaner-463600
gcloud config set run/region us-central1

gcloud builds submit --tag us-central1-docker.pkg.dev/email-cleaner-463600/email-cleaner/email-cleaner:$(git rev-parse --short HEAD)

gcloud run deploy email-cleaner \
  --image us-central1-docker.pkg.dev/email-cleaner-463600/email-cleaner/email-cleaner:$(git rev-parse --short HEAD) \
  --platform managed \
  --allow-unauthenticated=false \
  --add-cloudsql-instances email-cleaner-463600:us-central1:pg-instance \
  --set-env-vars NODE_ENV=production \
  --set-secrets GOOGLE_CLIENT_SECRET=projects/123/secrets/GOOGLE_CLIENT_SECRET:latest \
  --memory 512Mi --cpu 1 --max-instances 3
```

---

## 6) CI/CD — cloudbuild.yaml

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

---

## 7) Observability

- Logs: Cloud Logging (`service=email-cleaner`)
- Metrics: Cloud Monitoring (alerts: CPU > 80%, latency p95)
- Tracing: Cloud Trace for TTFB and request paths

---

## 8) Quick rollback

```bash
gcloud run revisions list --service email-cleaner
gcloud run services update-traffic email-cleaner --to-revisions REVISION@latest=0,REVISION@prev=100
```

---

## 9) Security best practices

1. Use least-privilege service accounts.
2. Store secrets only in Secret Manager.
3. Enable VPC-SC for sensitive data.
4. Use Cloud SQL IAM Auth instead of static passwords.
5. Retain logs for at least 30 days.

---

## 10) Summary

1. Multi-stage Dockerfile.
2. `.env.prod` managed via Secret Manager.
3. Enable required services and publish to Artifact Registry.
4. Deploy via Cloud Build + Cloud Run.
5. Monitor and rollback when needed.

---

**Last updated:** July 2025 — Architecture Team
