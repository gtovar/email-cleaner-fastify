# Deployment Guide — Google Cloud Run (Fastify Backend)

This document describes the **current production deployment** for the Fastify backend using **Cloud Run** and **Artifact Registry**.

---

## 1) Prerequisites

| Resource | Requirement | Notes |
| --- | --- | --- |
| **gcloud CLI** | Installed + authenticated | `gcloud auth login` |
| **Project** | `ultra-acre-431617-p0` | Billing enabled |
| **Region** | `us-central1` | Default used in this deployment |
| **Artifact Registry** | `email-cleaner` | Docker repo in `us-central1` |
| **PostgreSQL** | External (Heroku RDS) | Requires SSL |

---

## 2) Required environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Production mode |
| `DATABASE_URL` | Postgres connection string |
| `TOKEN_ENCRYPTION_KEY` | Base64 32 bytes |
| `INTERNAL_JWT_SECRET` | Session JWT secret |
| `GOOGLE_CLIENT_ID` | OAuth client |
| `GOOGLE_CLIENT_SECRET` | OAuth secret |
| `GOOGLE_REDIRECT_URI` | `https://api.emailcleaner.gilbertotovar.com/auth/google/callback` |
| `FRONTEND_ORIGIN` | `https://app.emailcleaner.gilbertotovar.com` |

Notes:
- SSL is required for Postgres in production.
- Secrets are **not** committed; use a local env file for deploy.

---

## 3) Build and deploy (Cloud Build + Cloud Run)

### 3.1 Build and push image

```bash
cd email-cleaner-fastify

TAG=cr-$(git rev-parse --short HEAD)-$(date +%Y%m%d%H%M%S)
IMAGE=us-central1-docker.pkg.dev/ultra-acre-431617-p0/email-cleaner/email-cleaner:$TAG

gcloud builds submit --tag "$IMAGE" .
```

### 3.2 Deploy to Cloud Run

Create a local env file (YAML map):
`email-cleaner-fastify/cloudrun.env.yaml`

```yaml
NODE_ENV: "production"
DATABASE_URL: "postgres://..."
TOKEN_ENCRYPTION_KEY: "base64-32-bytes"
INTERNAL_JWT_SECRET: "..."
GOOGLE_CLIENT_ID: "..."
GOOGLE_CLIENT_SECRET: "..."
GOOGLE_REDIRECT_URI: "https://api.emailcleaner.gilbertotovar.com/auth/google/callback"
FRONTEND_ORIGIN: "https://app.emailcleaner.gilbertotovar.com"
```

Deploy:

```bash
gcloud run deploy email-cleaner-api \
  --image "$IMAGE" \
  --region us-central1 \
  --project ultra-acre-431617-p0 \
  --env-vars-file /Users/gil/Documents/email-cleaner/email-cleaner-fastify/cloudrun.env.yaml
```

---

## 4) Database migrations (production)

Postgres requires SSL. Run from local machine:

```bash
DB_SSL=require DATABASE_URL="postgres://..." npm run db:migrate
```

---

## 5) Domain mapping (API)

Domain:
`api.emailcleaner.gilbertotovar.com`

Create mapping:

```bash
gcloud beta run domain-mappings create \
  --service email-cleaner-api \
  --domain api.emailcleaner.gilbertotovar.com \
  --platform managed \
  --project ultra-acre-431617-p0
```

DNS (GoDaddy):
- Type: `CNAME`
- Name: `api.emailcleaner`
- Value: `ghs.googlehosted.com.`

Verify:

```bash
gcloud beta run domain-mappings describe \
  --domain api.emailcleaner.gilbertotovar.com \
  --platform managed \
  --project ultra-acre-431617-p0
```

---

## 6) Public access (required for browser clients)

```bash
gcloud run services add-iam-policy-binding email-cleaner-api \
  --region us-central1 \
  --project ultra-acre-431617-p0 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

---

## 7) CI/CD automation (GitHub Actions)

Workflow: `.github/workflows/deploy.yml`

Required GitHub Secrets:
- `GCP_WIF_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `DATABASE_URL`
- `TOKEN_ENCRYPTION_KEY`
- `INTERNAL_JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Notes:
- Uses Workload Identity Federation (OIDC) for GCP auth (no keys).
- Deploys on `main` and on manual trigger.

---

## 8) Verification

```bash
curl -sS -D - -o /dev/null https://api.emailcleaner.gilbertotovar.com/api/v1/health/db
curl -sS -D - -o /dev/null https://api.emailcleaner.gilbertotovar.com/api/v1/auth/me
```

Expected:
- `/health/db` -> 200
- `/auth/me` -> 401 (no session)

---

## 9) Notes

- Service name: `email-cleaner-api`
- Project: `ultra-acre-431617-p0`
- Region: `us-central1`

---

**Last updated:** January 2026
