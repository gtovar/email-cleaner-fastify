# Email Cleaner Fastify

## Setup inicial

1. Instala dependencias:  npm install
2. Corre el servidor: node src/index.js
3. Visita `http://localhost:3000/` para validar el hello world.

## Estructura del proyecto

- Código principal: `/src/`
- Tests: `/tests/`
- Modelos y migraciones: `/src/models/`, `/migrations/

# Email Cleaner & Smart Notifications

Sistema inteligente para limpieza de correos y notificaciones personalizadas, con conexión segura a Gmail, filtrado avanzado y arquitectura modular.

---

## 🚀 Propósito del Proyecto
Automatizar la gestión del correo electrónico personal, priorizando seguridad, limpieza inteligente, categorización, y alertas personalizadas (vía WhatsApp, Telegram, etc.).

---

## ⚙️ Requisitos Técnicos

- Node.js v18+
- PostgreSQL 13+
- Google Cloud Project con OAuth2 activado
- `.env` con variables definidas (ver más abajo)

---

## 🧪 Instalación y Setup

```bash
# Clona el repositorio
$ git clone https://github.com/tu_usuario/email-cleaner.git
$ cd email-cleaner

# Instala dependencias
$ npm install

# Crea el archivo .env
$ cp .env.example .env
```

### Variables de entorno esperadas (`.env`)

```dotenv
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
DB_USERNAME=gilberto
DB_PASSWORD=admin
DB_DATABASE=email_cleaner
DB_HOST=127.0.0.1
DB_PORT=5432
```

---

## ▶️ Correr en modo local

```bash
$ node src/index.js
```

Verifica:
- `http://localhost:3000/` responde ✅
- `http://localhost:3000/docs` muestra Swagger UI ✅

---

## 🔐 Autenticación con Gmail

1. Accede a:
   ```
   http://localhost:3000/auth/google
   ```
2. Completa el login con tu cuenta Gmail
3. El token se guardará en la base de datos automáticamente

---

## 📬 Endpoints Clave

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/auth/google` | GET | Redirección a login con Google |
| `/api/mails` | GET | Lista correos con filtros (no leídos, promociones, adjuntos) |
| `/suggestions` | GET | Sugerencias de limpieza automática |
| `/notifications/summary` | GET | Agrupación por fechas de sugerencias |
| `/notifications/confirm` | POST | Confirmar acciones sobre correos |
| `/notifications/history` | GET | Historial de acciones |

> 🔧 Todos requieren `Bearer Token` en header excepto `/auth/google` y `/`

---

## 🧱 Arquitectura

- Backend: Fastify (modular, liviano, extensible)
- DB: PostgreSQL + Sequelize
- Gmail API: vía `googleapis`
- Autenticación: OAuth2 Google
- Documentación: Swagger (`/docs`)
- Pronto: integración con IA y mensajería automática

📌 Ver detalles técnicos en [`/docs/arquitectura.md`](docs/arquitectura.md)

---

## 🧑‍💻 Contribuir

- Revisa la guía en [`/docs/readme.guia.md`](docs/readme.guia.md)
- Sigue el estilo de commits convencional (`feat:`, `fix:`, `refactor:`...)
- Usa ramas `feature/nombre` o `fix/nombre`
- Documenta tus endpoints

---

## 📜 Licencia
Proyecto privado. No se permite redistribución sin autorización del autor.


