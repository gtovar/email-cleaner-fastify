# Guía de Seeders de Base de Datos

Esta guía describe cómo crear y ejecutar **seeders** usando **Sequelize CLI** para poblar datos iniciales o de referencia en **Email Cleaner & Smart Notifications**.

---

## 🎯 Objetivo

- Cargar datos de catálogo (roles, estados, plantillas) de forma reproducible.
- Facilitar ambientes de desarrollo con datos realistas.
- Evitar scripts manuales y errores humanos.

---

## 1️⃣ Herramientas

| Herramienta        | Versión | Uso principal                    |
| ------------------ | ------- | -------------------------------- |
| `sequelize-cli`    | ^7.x    | Generar & ejecutar seeders       |
| `umzug` (opcional) | ^4.x    | Correr seeders programáticamente |

Instalación (dev‑dependency):

```bash
npm install --save-dev sequelize-cli
```

---

## 2️⃣ Estructura de directorios

```plaintext
email-cleaner/
├── seeders/
│   └── YYYYMMDDHHmmss-create-roles.js
└── migrations/
```

> **Nota**: los seeders viven al mismo nivel que `migrations/` por convención Sequelize.

---

## 3️⃣ Naming Convention

```
YYYYMMDDHHmmss-descripcion.js
```

Ejemplo:

```
20250718143000-create-default-roles.js
```

- Timestamp UTC asegura orden.
- Descripción en *kebab‑case*.

---

## 4️⃣ Comandos básicos

| Acción                     | Comando                                          |
| -------------------------- | ------------------------------------------------ |
| Generar seeder             | `npx sequelize-cli seed:generate --name <desc>`  |
| Ejecutar todos los seeders | `npx sequelize-cli db:seed:all --env local`      |
| Deshacer último seeder     | `npx sequelize-cli db:seed:undo --env local`     |
| Deshacer todos los seeders | `npx sequelize-cli db:seed:undo:all --env local` |

Scripts recomendados en `package.json`:

```json
"scripts": {
  "seed": "sequelize-cli db:seed:all --env local",
  "seed:undo": "sequelize-cli db:seed:undo:all --env local"
}
```

---

## 5️⃣ Buenas Prácticas

1. **Sólo datos de referencia**: evita datos sensibles o temporales.
2. **Idempotencia lógica**: un seeder debe poder correrse múltiples veces (p.ej., `findOrCreate`).
3. **Separación por entorno**: usa `process.env.NODE_ENV` o seeders específicos (`development/`, `prod/`).
4. **Rollback siempre posible**: implementa `down` con la lógica inversa.
5. **Revísalo en PR**: incluye “qué y por qué” en la descripción.

---

## 6️⃣ Ejemplo de Seeder

```js
'use strict';
module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Roles', [
      { name: 'admin',        created_at: new Date(), updated_at: new Date() },
      { name: 'user',         created_at: new Date(), updated_at: new Date() },
      { name: 'viewer',       created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Roles', null, {});
  },
};
```

---

## 7️⃣ Integración con CI/CD

Añade paso antes de tests o después de migraciones en `cloudbuild.yaml`:

```yaml
- id: "DB Seed"
  name: "node:18-alpine"
  entrypoint: "sh"
  args:
    - "-c"
    - |
      npm ci --omit=dev
      npx sequelize-cli db:seed:all --env production
```

---

## 8️⃣ Preguntas frecuentes

| Pregunta                             | Respuesta rápida                                           |
| ------------------------------------ | ---------------------------------------------------------- |
| ¿Puedo modificar un seeder aplicado? | 🚫 No. Crea otro con nuevas inserciones o actualizaciones. |
| ¿En qué orden corren los seeders?    | Orden natural por timestamp del nombre.                    |
| ¿Cómo aplico un solo seeder?         | `db:seed:--seed 20250718143000-create-default-roles.js`    |

---

**Actualizado:** 18 jul 2025 – Área de Arquitectura

