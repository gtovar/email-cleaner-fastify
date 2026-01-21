# ADR 006: CI/CD Strategy (Fastify Backend)

## Status
Proposed

## Context
We need a reproducible, secure pipeline for the backend that:
- validates code on PRs and `develop`
- deploys automatically on `main`
- avoids long-lived credentials

## Decision
- **CI**: GitHub Actions runs lint + test on PRs and pushes to `develop`.
- **CD**: GitHub Actions deploys to Cloud Run on `main`.
- **Auth**: Use Workload Identity Federation (no service account keys).
- **Target**: Cloud Run in `us-central1`, service `email-cleaner-api`.

## Practical Examples

1) CI/CD con GitHub Actions

- PR a develop → corre:
  - npm run lint
  - npm test
  - npm run build
- Merge a main → despliega:
  - Fastify a Cloud Run
  - React a Vercel

Ejemplo de workflow:

```
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
      - run: gcloud run deploy ...
```

2) Infra como código (Terraform)

- Archivo cloudrun.tf define:
  - servicio Cloud Run
  - región us-central1
  - variables de entorno
  - permisos IAM
- Si mañana cambias de proyecto, ejecutas:

```
terraform apply
```

y recreas todo igual.

3) Staging y producción separados

- develop despliega a:
  - https://staging-api.tudominio.com
  - https://staging-app.tudominio.com
- main despliega a:
  - https://api.tudominio.com
  - https://app.tudominio.com

Así pruebas en staging antes de afectar usuarios.

4) Observabilidad integrada

- Al fallar login, recibes alerta en Slack:
  - “500 errors > 5% en /auth/google/callback”
- Dashboard muestra:
  - latencia p95
  - errores por endpoint
  - tasa de logins exitosos vs fallidos

## Alternatives Considered
1) **Cloud Build triggers**
   - Rejected: split visibility across GCP + GitHub; harder for PR-centric workflows.
2) **Service account key in GitHub Secrets**
   - Rejected: long-lived key risk; not preferred for production security.
3) **Manual deploy**
   - Rejected: error-prone and not reproducible.

## Consequences
- Deploys become automatic on `main`.
- CI failures block merges earlier.
- Requires WIF setup in GCP + GitHub OIDC trust.
