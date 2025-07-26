# Arquitectura Técnica - Email Cleaner & Smart Notifications

Este documento describe la arquitectura del sistema de limpieza inteligente de correos, alineada con la Guía Integral de Estilo de Código y Buenas Prácticas. Todo está justificado para entrevistas técnicas, mantenimiento y escalabilidad futura.

---

## 🎯 Objetivo de la Arquitectura

Diseñar un backend modular y extensible que permita:

- Conexión segura a Gmail vía OAuth2
- Lectura y filtrado inteligente de correos
- Generación de sugerencias de acción por IA o reglas
- Confirmación de acciones por el usuario
- Notificaciones programadas por otros canales (futuro)

---

## 📦 Componentes Principales

### 1. **Fastify Backend API (Node.js)**

- Framework backend liviano y modular
- Encargado de exponer rutas `/auth`, `/api/mails`, `/suggestions`, `/notifications/...`
- Usa `fastify-plugin` para registrar módulos como DB, auth y rutas

### 2. **Gmail API via googleapis**

- Cliente oficial de Google para acceder a correos del usuario autenticado
- Lectura de metadatos y contenido parcial de correos
- Aplica filtros: no leídos, promociones, adjuntos, antigüedad

### 3. **PostgreSQL + Sequelize**

- Almacena:
  - Tokens de acceso/refresh por usuario (`Token` model)
  - Historial de acciones tomadas (`actionHistory` model)
  - (Futuro) reglas personalizadas por usuario

### 4. **Servicios internos**

- `gmailService.js`: abstracción sobre Google Gmail API
- `emailSuggester.js`: lógica de sugerencia por reglas (o ML futura)
- `notificationsService.js`: coordina notificaciones pendientes y confirma acciones
- `authMiddleware.js`: extrae y valida `Bearer token` del header

### 5. **Swagger (**``**)**

- Documentación de API auto-generada
- Cubre parámetros, respuestas, errores y seguridad

---

## 🔐 Flujo de Autenticación

```plaintext
[Frontend o navegador]
    ↓ (GET /auth/google)
[Fastify Backend]
    ↓ (redirect)
[Google OAuth Consent Screen]
    ↓ (callback + code)
[Fastify Backend]
    ↳ Intercambia code por tokens
    ↳ Decodifica email
    ↳ Guarda en DB
```

> Luego, todos los endpoints requieren `Bearer access_token` en el header.

---

## 🧠 Flujo de Sugerencia y Acción

```plaintext
[Usuario autenticado] → GET /suggestions
                        ↳ usa gmailService → obtiene correos recientes
                        ↳ pasa por emailSuggester → aplica reglas
                        ↳ responde lista con sugerencias

[Usuario acepta] → POST /notifications/confirm
                  ↳ registra acción + (opcionalmente ejecuta en Gmail)
```

---

## 🔄 Extensibilidad futura

- 🤖 Agregar clasificación con IA (OpenAI o modelo propio)
- 📅 Agendar notificaciones (cron jobs o Cloud Tasks)
- 🔗 Dashboard web (Next.js o similar)
- 📤 Notificaciones por WhatsApp (Twilio), Telegram o email
- 🛡 Roles de usuario, configuración personalizada

---

## 🧱 Justificación de decisiones

| Decisión              | Justificación                                         |
| --------------------- | ----------------------------------------------------- |
| Fastify               | Modular, más rápido que Express, mejor para plugins   |
| OAuth2                | Requisito de seguridad por Gmail, evita contraseñas   |
| PostgreSQL            | Consistente, robusto, mejor para relaciones que NoSQL |
| Swagger               | Visibilidad y testing de API inmediato                |
| Arquitectura en capas | Favorece mantenibilidad, separación de concerns       |

---

## 🗺 Diagrama técnico (texto)

```plaintext
┌────────────┐      ┌─────────────────────────┐      ┌──────────────┐
│  Frontend  │◄────►│   Fastify API (Node.js) │◄────►│ PostgreSQL   │
└────────────┘      │                         │      └──────────────┘
                    │                         │
                    │  Plugins:               │
                    │   - DB (Sequelize)      │
                    │   - AuthMiddleware      │
                    │   - GmailService        │
                    │   - emailSuggester      │
                    │   - Swagger (/docs)     │
                    └────────┬────────────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │     Gmail API        │
                    └──────────────────────┘
```

---

Para mayor detalle de flujos, endpoints o pruebas, consultar [`README.md`](../README.md).


