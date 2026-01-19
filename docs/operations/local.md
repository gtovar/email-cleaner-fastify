# Local Environment (Docker / Host)

## Requirements
- Docker Desktop or Colima
- Make (optional)

## Start everything
```bash
docker compose -f ops/docker-compose.yml up --build
```

## Quick flow (3 steps)
1) Start services:
```bash
make -C ops up
```

2) Run migrations (choose one):
```bash
# Host-local (DB mapped to 5432)
npm run db:migrate
# Or inside the Fastify container
make -C ops migrate-in
```

3) Smoke test:
```bash
curl -s http://localhost:3000/api/v1/health/db
```
Expected output: `{"db":"ok"}`

---

## Smoke tests

### 1) Migrations
```bash
npm run db:migrate
npm run db:seed   # optional
```

### 2) DB health
```bash
curl -s http://localhost:3000/api/v1/health/db
```

### 3) API readiness
- OAuth flow: `GET /auth/google`
- Suggestions: `GET /api/v1/suggestions` (requires session cookie)

---

## Host vs Docker mapping

| Component | Docker (recommended) | Host-local (alternative) |
| --- | --- | --- |
| Fastify API | http://localhost:3000 | http://localhost:3000 |
| FastAPI ML | http://fastapi:8000 | http://localhost:8000 |
| DB host | db | 127.0.0.1 |
| DB port | 5432 | 5432 |
| Sequelize | DB_HOST=db | DB_HOST=127.0.0.1 |
| Health DB | /api/v1/health/db | /api/v1/health/db |

> Note: if you set `DATABASE_URL`, it takes precedence in Sequelize.

---

## OAuth note (local)
The canonical auth flow is cookie-based:
- Backend sets `session_token` after `/auth/google/callback`.
- Frontend uses `credentials: "include"` for API requests.

For API tools you can pass the session JWT as:
```
Authorization: Bearer <SESSION_TOKEN>
```

## Token encryption (required)
The backend encrypts OAuth tokens at rest. Set this in `.env`:
```
TOKEN_ENCRYPTION_KEY=<base64-32-bytes>
```

## TLS (optional)
If you want HTTPS locally, set:
```
TLS_CERT_PATH=/path/to/cert.pem
TLS_KEY_PATH=/path/to/key.pem
PORT_HTTPS=3000
PORT_HTTP=3001
```
If TLS paths are not set, the server runs HTTP only.

---

## Available services
- Fastify: http://localhost:3000
- FastAPI (ML): http://localhost:8000/docs
- Postgres: localhost:5432
- n8n: http://localhost:5678

---

## Makefile (ops)
Run commands with:
```bash
make -f ops/Makefile up
make -f ops/Makefile migrate
make -f ops/Makefile smoke
```
