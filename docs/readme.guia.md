# 📘 Official README Writing Guide

This guide defines the minimum structure and best practices for creating consistent `README.md` files across **Email Cleaner & Smart Notifications** and related projects.  
Inspired by:

- **Readme‑Driven Development** — Tom Preston‑Werner  
- **GitHub Open Source Guides**  
- **Google Engineering Practices**  
- **Clean Architecture / The Art of Readable Code**  

---

## 🎯 Purpose of a README

1. **Onboarding in ≤ 2 minutes:** any developer should understand and run the project locally.  
2. **Single source of truth:** the README is the entry point; avoid duplicating critical info elsewhere.  
3. **Implicit contract:** it defines expectations before writing code.  

---

## 🧩 Required Structure

| Section                          | Description                                    | Purpose                         |
| -------------------------------- | ---------------------------------------------- | ------------------------------- |
| **Title**                        | Concise, descriptive project name.             | Immediate identification.       |
| **Description / Purpose**        | One‑sentence summary of the problem it solves. | “Start with why.”               |
| **Technical Requirements**       | Language, DB, and service versions.            | Prevent environment mismatches. |
| **Installation & Configuration** | Steps to clone, install, and set up `.env`.    | Accelerate onboarding.          |
| **Basic Usage**                  | Minimal run or API example.                    | Quick verification.             |
| **Extended Docs**                | Links to `/docs/*.md` or Swagger.              | Keep the README lightweight.    |
| **Contribution**                 | PR, branch, and commit rules.                  | Maintain team consistency.      |
| **License**                      | License type or privacy notice.                | Legal compliance.               |

> Rule of thumb: if a section exceeds 4 lines, move it to `/docs/` and link it.

---

## 🧱 Optional Sections

- System overview or architecture diagram  
- Roadmap or backlog  
- Project status (badges)  
- Advanced usage examples (API/CLI)  
- FAQ or troubleshooting guide  

---

## ✍️ Style Conventions

- Write in **second person** (“You can run…”)  
- Use **short sentences** and **clear lists**  
- Avoid internal jargon or abbreviations  
- Always specify the language in code blocks  
- Limit lines to ~80 characters for readability  

---

## ✅ Pre‑Merge Checklist

- [ ] Includes all required sections  
- [ ] Installation steps verified  
- [ ] Example commands tested locally  
- [ ] All links functional (`npm run lint:links`)  
- [ ] CI badge shows *passing* status  

---

## 📋 Base Template

```markdown
# <Project Name>

Brief description of its purpose.

## Requirements
- Node.js vXX
- PostgreSQL

## Installation
```bash
npm install
```

## Quick Start
```bash
npm start
```

## Documentation
- Architecture: [architecture.md](architecture.md)
- Deployment: [despliegue-cloudrun.md](despliegue-cloudrun.md)

## Contribution
1. Create branch `feature/<name>`  
2. Run `npm test`  
3. Open PR with clear description

## License
MIT (or Private)
```

---

**Last updated:** July 2025 — Architecture Team  