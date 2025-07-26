# Guía de Migraciones de Base de Datos

Esta guía explica cómo versionar, crear y desplegar cambios de esquema en **Email Cleaner & Smart Notifications** usando **Sequelize Migrations**. Está alineada con la *Guía Integral de Estilo de Código y Buenas Prácticas* y el *Road‑map para Infraestructura*.

---

## 🎯 Objetivo

- Garantizar consistencia de esquema entre entornos (local, staging, producción).
- Permitir rollback seguro ante errores.
- Facilitar revisiones en PR y auditorías.

---

## 1️⃣ Herramientas y dependencias

| Herramienta          | Versión | Uso principal                          |
| -------------------- | ------- | -------------------------------------- |
| **Sequelize**        | ^7.x    | ORM principal                          |
| **sequelize-cli**    | ^7.x    | Generar y ejecutar migraciones         |
| **umzug** (opcional) | ^4.x    | Ejecutar migraciones programáticamente |

Instala CLI global o vía `npm` local:

```bash
npm install --save-dev sequelize-cli
```

---

## 2️⃣ Estructura de directorios

```plaintext
email-cleaner/
├── src/
├── migrations/           # Archivos de migración YYYYMMDDHHmmss-create-...js
├── seeders/              # Datos iniciales opcionales
└── config/
    └── config.js         # Config DB por ambiente (local, test, prod)
```

> **Justificación**: estructura estándar de Sequelize facilita integración con CI/CD y lectura rápida en entrevistas técnicas.

---

## 3️⃣ Naming Convention

```
YYYYMMDDHHmmss-descripcion-clara.js
```

Ejemplo:

```
20250718104500-add-column-is_archived-to-emails.js
```

- **Fecha UTC** asegura orden natural.
- Descripción en *kebab-case* refleja cambio.

---

## 4️⃣ Comandos básicos

| Acción              | Comando                                              |
| ------------------- | ---------------------------------------------------- |
| Crear migración     | `npx sequelize-cli migration:generate --name <desc>` |
| Ejecutar pendientes | `npx sequelize-cli db:migrate --env local`           |
| Ejecutar rollback   | `npx sequelize-cli db:migrate:undo --env local`      |
| Ver estado          | `npx sequelize-cli db:migrate:status`                |

> **Tip**: Añade scripts a `package.json` para simplificar.

```json
"scripts": {
  "migrate": "sequelize-cli db:migrate --env local",
  "migrate:undo": "sequelize-cli db:migrate:undo --env local"
}
```

---

## 5️⃣ Buenas prácticas

1. **Transaccionales**: usa `return queryInterface.sequelize.transaction(async (t) => { ... })` para asegurar atomicidad.
2. **Reversible**: implementa siempre `down()` espejo de `up()`.
3. **Idempotencia**: evita cambiar una migración ya aplicada; crea una nueva.
4. **Revisión de PR**: describe el impacto y adjunta salida de `db:migrate:status`.
5. **Seeders** solo para datos de catálogo; nunca para datos sensibles.

---

## 6️⃣ Integración con CI/CD

En `cloudbuild.yaml`, agrega paso antes del deploy:

```yaml
- id: "DB Migrate"
  name: "node:18-alpine"
  entrypoint: "sh"
  args:
    - "-c"
    - |
      npm ci --omit=dev
      npx sequelize-cli db:migrate --env production
```

> **Justificación**: asegura que la base esté en la versión correcta antes de desplegar la nueva revisión de servicio.

---

## 7️⃣ Rollback en Producción

1. Ejecuta `db:migrate:undo --env production` (deshace la última migración).
2. Si el servicio ya está desplegado, haz rollback de Cloud Run (`docs/despliegue-cloudrun.md` sección 8).
3. Documenta en el historial de incidentes.

---

## 8️⃣ Ejemplo de migración

```js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'Emails',
      'is_archived',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }
    );
  },
  async down(queryInterface) {
    return queryInterface.removeColumn('Emails', 'is_archived');
  },
};
```

---

## 9️⃣ Preguntas frecuentes

| Pregunta                                  | Respuesta breve                                          |
| ----------------------------------------- | -------------------------------------------------------- |
| **¿Puedo editar una migración aplicada?** | 🚫 No, crea una nueva (evita inconsistencias).           |
| **¿Cómo aplico solo una migración?**      | Usa `--to 20250718104500` con `db:migrate`.              |
| **¿Cómo pruebo migraciones en CI?**       | Ambiente `test` + `db:migrate` antes de tests unitarios. |

---

**Actualizado:** 18 jul 2025 – Área de Arquitectura


