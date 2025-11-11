# Entorno Local (Docker / Host)

## Requisitos
- Docker Desktop o Colima
- Make (opcional)

## Levantar todo
```bash
docker compose -f ops/docker-compose.yml up --build
```
## Flujo rápido (3 pasos)
1) Arranque servicios:
```bash
make -C ops up
```
2) Migraciones (elige una):
```bash
# Host-local (DB mapeada a 5432)
npm run db:migrate
# Ó dentro del contenedor Fastify
make -C ops migrate-in
```
3) Smoke test:
```bash
curl -s http://localhost:3000/api/v1/health/db
```
Salida esperada: `{"db":"ok"}`



## Smoke tests

### 1) Migraciones
```bash
npm run db:migrate
npm run db:seed   # opcional
```

### 2) Salud de BD
```bash
curl -s http://localhost:3000/api/v1/health/db
# -> {"db":"ok"}
```

### 3) Api oficial

## Tabla de equivalencias (Host vs Docker)

| Componente | Docker (recomendado) | Host-local (alternativa) |
|------------|-----------------------------|--------------------------------|
| App JS | http://localhost:3000
| http://localhost:3000
|
| FastAPI | http://fastapi:8000
| http://localhost:8000
|
| DB Host | db | 127.0.0.1 |
| DB Puerto | 5432 | 5432 |
| Sequelize | DB_HOST=db | DB_HOST=127.0.0.1 |
| Health DB | /api/v1/health/db | /api/v1/health/db |

> Nota: si defines DATABASE_URL, tendrá prioridad en Sequelize.

## Notas
- OAuth Google: postergado. La integración se documentará cuando pase de “experimental” a “listo para QA”. De momento no se requiere mock ni setup adicional.

---

## Mock de OAuth (documentación)

⚠️ `OAUTH_MODE=mock` documentado; **implementación pendiente**.
Para pruebas sin OAuth real, use los endpoints de **Notificaciones** con `Authorization: Bearer dummy`.

---

## Servicios disponibles
- Fastify: http://localhost:3000
- FastAPI (ML): http://localhost:8000/docs
- Postgres: localhost:5432
- n8n: http://localhost:5678

---

## Makefile (en la carpeta ops)
Ejecutar comandos con:
```bash
make -f ops/Makefile up
make -f ops/Makefile migrate
make -f ops/Makefile smoke
```

