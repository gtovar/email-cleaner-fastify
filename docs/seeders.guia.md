# Database Seeder Guide

This guide explains how to create and execute **seeders** using **Sequelize CLI** to populate initial or reference data for **Email Cleaner & Smart Notifications**.

---

## Purpose

- Load reproducible reference data (roles, states, templates, etc.).
- Simplify local development with realistic datasets.
- Eliminate manual SQL scripts and reduce human error.

---

## 1) Tools

| Tool | Version | Purpose |
| --- | --- | --- |
| sequelize-cli | ^7.x | Generate and execute seeders |
| umzug (optional) | ^4.x | Run seeders programmatically |

Install as a dev dependency:
```bash
npm install --save-dev sequelize-cli
```

---

## 2) Directory structure

```plaintext
email-cleaner/
├── seeders/
│   └── YYYYMMDDHHmmss-create-roles.js
└── migrations/
```

---

## 3) Naming convention

```
YYYYMMDDHHmmss-description.js
```

Example:
`20250718143000-create-default-roles.js`

---

## 4) Core commands

| Action | Command |
| --- | --- |
| Generate seeder | `npx sequelize-cli seed:generate --name <description>` |
| Run all seeders | `npx sequelize-cli db:seed:all --env local` |
| Undo last seeder | `npx sequelize-cli db:seed:undo --env local` |
| Undo all seeders | `npx sequelize-cli db:seed:undo:all --env local` |

Add convenient scripts to `package.json`:

```json
"scripts": {
  "seed": "sequelize-cli db:seed:all --env local",
  "seed:undo": "sequelize-cli db:seed:undo:all --env local"
}
```

---

## 5) Best practices

1. Use only for **reference data**, not user data.
2. Prefer `findOrCreate` over `bulkInsert` for idempotence.
3. Separate seeders by environment (`NODE_ENV`).
4. Always implement `down()` for rollback.
5. Document purpose and context in each PR.

---

## 6) Example seeder

```js
'use strict';
module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Roles', [
      { name: 'admin', created_at: new Date(), updated_at: new Date() },
      { name: 'user', created_at: new Date(), updated_at: new Date() },
      { name: 'viewer', created_at: new Date(), updated_at: new Date() }
    ]);
  },
  async down(queryInterface) {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};
```

---

## 7) CI/CD integration (optional)

```yaml
- id: DB Seed
  name: node:18-alpine
  entrypoint: sh
  args:
    - "-c"
    - |
      npm ci --omit=dev
      npx sequelize-cli db:seed:all --env production
```

---

## 8) FAQ

| Question | Answer |
| --- | --- |
| Can I edit an applied seeder? | No — create a new one. |
| How are seeders executed? | Sorted by timestamp ascending. |
| Can I run only one seeder? | Use `db:seed --seed <file>.js`. |

---

**Last updated:** July 2025 — Architecture Team
