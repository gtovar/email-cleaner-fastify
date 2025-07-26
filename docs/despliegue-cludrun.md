# Guía de Despliegue a Google Cloud Run

Esta guía describe paso a paso cómo empaquetar y desplegar **Email Cleaner & Smart Notifications** en Google Cloud Run, siguiendo la *Guía Integral de Estilo de Código y Buenas Prácticas* y el *Road‑map para Infraestructura*.

---

## 🎯 Objetivo

- Mantener despliegues **reproducibles y seguros**.
- Minimizar tiempo de salida a producción (CI/CD).
- Asegurar buenas prácticas de **credenciales y variables de entorno**.

---

## 1️⃣ Prerrequisitos

| Recurso                | Versión / Requisito                  | Notas                                  |
| ---------------------- | ------------------------------------ | -------------------------------------- |
| **gcloud CLI**         | 475+                                 | `brew install --cask google-cloud-sdk` |
| **Google Cloud Proj.** | Facturado + Cloud Run, Artifact Reg. | Usa el mismo del OAuth2                |
| **Docker**             | 24+                                  | Para builds locales                    |
| **PostgreSQL**         | Cloud SQL o externo accesible        | Preferible Cloud SQL con VPC‑SC        |
| **Config .env.prod**   | Variables sensibles ENCRYPTED        | Ver sección 4                          |

---

## 2️⃣ Estructura de directorios

```plaintext
email-cleaner/
├── Dockerfile
├── cloudbuild.yaml        # Pipeline CI/CD (opcional)
└── src/
```

---

## 3️⃣ Dockerfile de referencia

```dockerfile
# Etapa 1 – build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build # si aplica (TS)

# Etapa 2 – runtime optimizado
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/index.js"]
```

> **Justificación**: multi‑stage build reduce tamaño, favorece arranque rápido (Clean Docker Images principle).

---

## 4️⃣ Variables de entorno (ejemplo `.env.prod`)

| Variable               | Ejemplo / Nota                         |
| ---------------------- | -------------------------------------- |
| `PORT`                 | 8080 (Cloud Run auto‑inyecta)          |
| `GOOGLE_CLIENT_ID`     | *secreto en Secret Manager*            |
| `GOOGLE_CLIENT_SECRET` | idem                                   |
| `DB_HOST`              | `/cloudsql/<CONN_NAME>` (si Cloud SQL) |
| `DB_USERNAME`          | usuario                                |
| `DB_PASSWORD`          | **Secret Manager**                     |

**Recomendación**: usar **Secret Manager** + referencia a runtime env (`--set-secrets`).

---

## 5️⃣ Despliegue manual (primer deploy)

```bash
# Autenticación gcloud
$ gcloud init
$ gcloud auth application-default login

# Habilitar servicios (una sola vez)
$ gcloud services enable run.googleapis.com artifactregistry.googleapis.com sqladmin.googleapis.com

# Configura región y proyecto
$ gcloud config set project email-cleaner-463600
$ gcloud config set run/region us-central1

# Construir y publicar la imagen
$ gcloud builds submit --tag us-central1-docker.pkg.dev/email-cleaner-463600/email-cleaner/email-cleaner:$(git rev-parse --short HEAD)

# Desplegar a Cloud Run
$ gcloud run deploy email-cleaner \
    --image us-central1-docker.pkg.dev/email-cleaner-463600/email-cleaner/email-cleaner:$(git rev-parse --short HEAD) \
    --platform managed \
    --allow-unauthenticated=false \
    --add-cloudsql-instances email-cleaner-463600:us-central1:pg-instance \
    --set-env-vars NODE_ENV=production \
    --set-secrets GOOGLE_CLIENT_SECRET=projects/123/secrets/GOOGLE_CLIENT_SECRET:latest \
    --memory 512Mi --cpu 1 --max-instances 3
```

> **Notas**:
>
> - `--allow-unauthenticated=false` fuerza autenticación IAM.
> - `--add-cloudsql-instances` monta el socket Cloud SQL.
> - `--memory` y `--cpu` optimizados por costo (ver Road‑map Infraestructura).

---

## 6️⃣ Configuración de CI/CD (cloudbuild.yaml)

```yaml
steps:
  - id: "Build & Push"
    name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "$LOCATION-docker.pkg.dev/$PROJECT_ID/email-cleaner/email-cleaner:$SHORT_SHA", "."]

  - id: "Deploy"
    name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: "gcloud"
    args:
      ["run", "deploy", "email-cleaner", "--image", "$LOCATION-docker.pkg.dev/$PROJECT_ID/email-cleaner/email-cleaner:$SHORT_SHA", "--platform", "managed", "--region", "$LOCATION", "--quiet"]

images:
  - "$LOCATION-docker.pkg.dev/$PROJECT_ID/email-cleaner/email-cleaner:$SHORT_SHA"
```

> **Os**: se ejecuta en Cloud Build al cada push a `main` (configurado en trigger).

---

## 7️⃣ Observabilidad

- **Logs**: Cloud Run → Cloud Logging (consultar por service `email-cleaner`).
- **Métricas**: Cloud Monitoring → crear alertas de CPU > 80% o latencia p95.
- **Tracing**: habilitar Cloud Trace para TTFB.

---

## 8️⃣ Rollback rápido

```bash
$ gcloud run revisions list --service email-cleaner
$ gcloud run services update-traffic email-cleaner --to-revisions REVISION@latest=0,REVISION@prev=100
```

> **Justificación**: tráfico 100 % a la revisión anterior (blue‑green style).

---

## 9️⃣ Seguridad & Buenas Prácticas

1. **Principio de mínimo privilegio**: cuentas de servicio separadas para Cloud Run y Cloud Build.
2. **Secrets** en Secret Manager, no en variables de entorno planas.
3. **VPC‑SC** si manejamos datos sensibles.
4. **Cloud SQL IAM auth** para Postgres (evita contraseñas duras).
5. **Preserve logs** → política de retención 30 días mínimo.

---

## 🔚 Resumen de pasos

1. Prepara Dockerfile → build multi‑stage.
2. Configura `.env.prod` con secretos en Secret Manager.
3. Habilita servicios y crea Artifact Registry.
4. `gcloud builds submit` + `gcloud run deploy` (o CI/CD).
5. Observa logs y métricas, ajusta autoscaling.
6. Usa rollback ante fallos.

---

**Actualizado**: 18 jul 2025 – Área de Arquitectura.


