# 🤝 Contribution Guide — Email Cleaner & Smart Notifications

Thank you for contributing to this project 💌  
This guide ensures consistency, code quality, and efficient collaboration.

---

## 🧱 Project Structure

* `src/` — Fastify backend source code  
* `docs/` — Technical documentation and tutorials  
* `ops/` — Infrastructure and CI/CD scripts  
* `tests/` — Unit and integration tests  

---

## 🧩 Workflow

1. **Create a descriptive branch**
   ```bash
   git checkout -b feat/new-feature
   ```

2. **Follow Conventional Commits**
   ```bash
   git commit -m "feat: add email classification endpoint"
   git commit -m "fix: correct token validation error"
   ```

3. **Run tests before pushing**
   ```bash
   npm test
   ```

4. **Submit a Pull Request (PR)**
   - Clearly describe what changed and why.  
   - Include screenshots or logs if applicable.  
   - Reference related issues.  

---

## 🧠 Code Conventions

- Use **English names** for functions and variables (`EmailService`, `RuleController`).  
- Maintain consistent style via **Prettier + ESLint**.  
- Avoid logic duplication (“Don’t Repeat Yourself”).  
- Document public methods using **JSDoc**.  
- Maintain **≥ 80% test coverage** per PR.  

---

## 🧪 Testing

**Backend (Fastify):**
```bash
npm run test:unit
npm run test:integration
```

**ML Microservice (Python):**
```bash
pytest -v
```

Every PR must include at least one relevant unit or integration test.

---

## 🧰 Branching & Versioning Standards

| Type          | Prefix      | Example                   |
| ------------- | ----------- | ------------------------- |
| New feature   | `feat/`     | feat/auto-rules           |
| Bug fix       | `fix/`      | fix/token-expiration      |
| Documentation | `docs/`     | docs/api-reference        |
| Refactor      | `refactor/` | refactor/plugin-structure |
| Maintenance   | `chore/`    | chore/update-dependencies |

**Versioning:** Semantic Versioning (SemVer)  
Format: `MAJOR.MINOR.PATCH` → Example: `1.4.2`

---

## 🧾 Commit Guidelines (Conventional Commits)

```bash
<type>(<scope>): <short description>
# Valid types: feat | fix | docs | style | refactor | test | chore
```

Example:
```bash
feat(auth): implement Gmail refresh token logic
```

---

## 🧱 Code Review Checklist

Before approving a PR:

1. Validate that CI tests pass.  
2. Review variable and function naming.  
3. Ensure no `console.log` or secrets are left in code.  
4. Confirm alignment with the project’s style guide.  

---

## 🧾 Pull Request Checklist

- [ ] Tests pass locally and in CI  
- [ ] Lint runs cleanly (no warnings or errors)  
- [ ] Documentation or comments updated if needed  
- [ ] No unnecessary dependencies introduced  
- [ ] Conventional commits respected  
- [ ] Includes at least one new or updated test  

---

## 👥 Maintainer Contact

**Maintainer:** Gilberto Tovar  
📧 contacto@gilbertotovar.com
🌐 [www.gilbertotovar.com](https://www.gilbertotovar.com)

---

**Last updated:** July 2025  
