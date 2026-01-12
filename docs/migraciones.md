# Database Migration Guide

This document explains how to version, create, and deploy schema changes for **Email Cleaner & Smart Notifications** using **Sequelize Migrations**.

---

## Purpose

- Maintain consistent database schemas across environments (local, staging, production).
- Allow safe rollbacks on deployment errors.
- Enable traceable and auditable schema changes via PRs.

---

## 1) Tools & dependencies

| Tool | Version | Purpose |
| --- | --- | --- |
| Sequelize | ^7.x | ORM |
| sequelize-cli | ^7.x | CLI for migration management |
| umzug (optional) | ^4.x | Programmatic migration runner |

Install the CLI:
```bash
npm install --save-dev sequelize-cli
```

---

## 2) Directory structure

```plaintext
email-cleaner/
├── src/
├── migrations/           # YYYYMMDDHHmmss-descriptive-name.js
├── seeders/              # Optional initial data
└── config/
    └── config.js         # Environment-specific DB configuration
```

---

## 3) Naming convention

```
YYYYMMDDHHmmss-description.js
```

Example:
`20250718104500-add-column-is_archived-to-emails.js`

Timestamps in UTC ensure proper ordering and deterministic execution.

---

## 4) Core commands

| Action | Command |
| --- | --- |
| Generate migration | `npx sequelize-cli migration:generate --name <description>` |
| Apply pending migrations | `npx sequelize-cli db:migrate --env local` |
| Undo last migration | `npx sequelize-cli db:migrate:undo --env local` |
| View migration status | `npx sequelize-cli db:migrate:status` |

Recommended `package.json` scripts:
```json
"scripts": {
  "migrate": "sequelize-cli db:migrate --env local",
  "migrate:undo": "sequelize-cli db:migrate:undo --env local"
}
```

---

## 5) Best practices

1. **Transactional:** wrap migrations in `queryInterface.sequelize.transaction(...)`.
2. **Reversible:** always implement `down()` for rollback.
3. **Idempotent:** never modify an applied migration — create a new one.
4. **Auditable:** describe each change in PRs and include `db:migrate:status` output.
5. **Seeders:** use only for static or reference data, never for user content.

---

## 6) CI/CD integration

Include this step before deployment in `cloudbuild.yaml`:

```yaml
- id: DB Migrate
  name: node:18-alpine
  entrypoint: sh
  args:
    - "-c"
    - |
      npm ci --omit=dev
      npx sequelize-cli db:migrate --env production
```

---

## 7) Production rollback

1. Run `db:migrate:undo --env production`.
2. If already deployed, roll back the Cloud Run revision.
3. Log and document the rollback in the incident record.

---

## 8) Migration example

```js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Emails', 'is_archived', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },
  async down(queryInterface) {
    return queryInterface.removeColumn('Emails', 'is_archived');
  }
};
```

---

## 9) FAQ

| Question | Answer |
| --- | --- |
| Can I edit an applied migration? | No — always create a new one. |
| How do I run a single migration? | Use `--to <timestamp>` with `db:migrate`. |
| How do I test migrations in CI? | Execute `db:migrate` before running unit tests. |

---

**Last updated:** July 2025 — Architecture Team
