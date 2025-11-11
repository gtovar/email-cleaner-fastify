# ⚡ Quickstart — Email Cleaner & Smart Notifications

Guía rápida para levantar el entorno local del proyecto y validar el flujo principal de clasificación de correos.

---

## 🚀 1. Requisitos Previos

| Componente        | Versión mínima | Propósito                        |
| ----------------- | -------------- | -------------------------------- |
| Node.js           | 18.x LTS       | Backend (Fastify)                |
| Python            | 3.10+          | Microservicio ML                 |
| PostgreSQL        | 14+            | Base de datos                    |
| Docker (opcional) | 24+            | Entorno reproducible             |
| Gmail API         | v1             | Integración con correo           |
| n8n (opcional)    | Latest         | Automatización de notificaciones |

---

## ⚙️ 2. Clonar y Configurar

```bash
git clone https://github.com/gilbertotovar/email-cleaner-fastify.git
cd email-cleaner-fastify
cp .env.example .env
```

Edita las variables del `.env`:

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
DB_HOST=localhost
DB_USER=postgres
DB_PASS=secret
DB_NAME=email_cleaner
```

---

## 🧱 3. Instalación de Dependencias

**Backend (Node.js):**
```bash
npm install
```

**Microservicio ML (Python):**
```bash
cd python/classifier
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🧩 4. Iniciar los Servicios

**Backend (Fastify):**
```bash
npm run dev
# http://localhost:3000
```

**Microservicio ML (FastAPI):**
```bash
uvicorn main:app --reload --port 8000
# http://localhost:8000/docs
```

**(Opcional) Notificaciones n8n:**
```bash
docker run -it -p 5678:5678 n8nio/n8n
```

---

## 📬 5. Flujo Básico de Prueba

1. Iniciar ambos servicios (Node.js + Python).  
2. Llamar a `/api/v1/emails/test` con un ejemplo de correo JSON.  
3. Ver la respuesta del clasificador ML (categoría + acción).  
4. Confirmar persistencia en PostgreSQL.  

Ejemplo de llamada:

```bash
curl -X POST http://localhost:3000/api/v1/emails/classify -H "Content-Type: application/json" -d '{
  "from": "facturas@cfe.mx",
  "subject": "Tu recibo de luz",
  "body": "Vence el 15 de noviembre. Monto $350."
}'
```

---

## 🧪 6. Pruebas Unitarias

**Node.js:**
```bash
npm run test
```

**Python:**
```bash
pytest -v
```

---

## ☁️ 7. Despliegue (resumen)

1. Build de Docker con `gcloud builds submit`.  
2. Despliegue en Cloud Run.  
3. Conexión con Cloud SQL.  
4. Integración con Secret Manager.  

(Ver `despliegue-cloudrun.md` para la guía completa).

---

## 🧾 8. Recursos Relacionados

- `API_REFERENCE.md` — Endpoints disponibles.  
- `DESIGN_DOCUMENT.md` — Arquitectura y decisiones técnicas.  
- `architecture.md` — Diagrama de flujo Mermaid.  
- `migraciones.md` — Esquema y gestión de base de datos.  
- `seeders.guia.md` — Carga inicial de datos.  

---

**Última actualización:** Julio 2025 — Equipo de Arquitectura  
