# Guía Oficial para Escribir README.md

Esta guía define la estructura mínima y las mejores prácticas para crear un `README.md` consistente en todos los proyectos de **Email Cleaner & Smart Notifications** (y futuros repos). Está fundamentada en:

- **Readme‑Driven Development** – Tom Preston‑Werner
- **GitHub Open Source Guides**
- **Google Engineering Practices**
- **Clean Architecture / The Art of Readable Code**

---

## 🎯 Objetivo del README.md

1. **Onboarding en ≤2 minutos**: cualquier desarrollador debe entender de qué trata el proyecto y cómo ponerlo a correr.
2. **Referència única**: punto de entrada para toda la documentación; nunca duplicar información clave fuera del README.
3. **Contrato implícito**: define expectativas de interfaz y uso antes de escribir código (Readme‑Driven Dev).

---

## 🏗 Estructura Mínima Requerida

| Sección | Descripción | Justificación |
|---------|-------------|---------------|
| **Título** | Nombre corto y descriptivo. | Identificable en GitHub/NPM. |
| **Descripción / Propósito** | ¿Qué problema resuelve en una frase? | “Start with WHY” (Simon Sinek). |
| **Requisitos Técnicos** | Versiones de lenguajes, DB, servicios externos. | Reduce errores de entorno. |
| **Instalación & Setup** | Comandos `git clone`, `npm install`, `.env`. | Onboarding en 2 min. |
| **Uso Básico** | Ejemplo mínimo de ejecución o petición API. | Prueba de humo inmediata. |
| **Documentación extendida** | Links a `/docs/*.md` o Swagger. | Mantiene README liviano. |
| **Contribuir** | Normas de ramas, commits, linters, tests. | Consistencia entre PRs. |
| **Licencia** | Tipo de licencia o nota de privacidad. | Obligatorio legalmente. |

> **Regla de oro**: si una sección no cabe en 3‑4 líneas, muévela a `/docs/` y enlázala.

---

## 🔧 Secciones Opcionales (añadir solo si aportan valor)

- **Arquitectura Resumida**: diagrama o párrafo con los componentes.
- **Roadmap / Backlog**: funcionalidades planeadas.
- **Estado del proyecto**: badges de CI, cobertura, versión.
- **Ejemplos Avanzados**: snippets completos de API o CLI.
- **FAQ / Troubleshooting**: preguntas recurrentes.

---

## 📝 Convenciones de Estilo

- Lenguaje **claro y en segunda persona** (“Tú puedes…”).
- Frases cortas, listas enumeradas, tablas solo cuando aporten.
- Evitar jerga no técnica o chistes internos.
- Código en bloques triple backtick con lenguaje especificado.
- Máximo **80 caracteres por línea** para legibilidad en terminales.

---

## ✅ Checklist antes de mergear

- [ ] Contiene todas las secciones mínimas.
- [ ] Pasos de instalación reproducibles sin errores.
- [ ] Ejemplo de uso probado localmente.
- [ ] Enlaces verificados (`npm run lint:links`).
- [ ] Badge de CI muestra **passing**.

---

## 📄 Plantilla de Referencia (Markdown)

```markdown
# <Nombre del Proyecto>

Breve descripción del propósito.

## Requisitos
- Node.js vXX
- …

## Instalación
```bash
npm install
```

## Uso rápido
```bash
npm start
```

## Documentación
- Arquitectura: [docs/arquitectura.md](docs/arquitectura.md)
- Despliegue: [docs/despliegue-cloudrun.md](docs/despliegue-cloudrun.md)

## Contribuir
1. Crea rama `feature/<nombre>`
2. Ejecuta tests `npm test`
3. Abre PR con descripción detallada

## Licencia
MIT (o privativa)
```

---

## 📚 Bibliografía / Fuentes

1. _Preston‑Werner, T._ “Readme Driven Development”, 2010.
2. GitHub. “Starting an Open Source Project”, Open Source Guides.
3. Google. “Engineering Practices Documentation”.
4. Martin, R.C. “Clean Architecture”, 2017.
5. Boswell & Foucher. “The Art of Readable Code”, 2011.

---

**Actualizado:** 18 jul 2025 – Área de Arquitectura.


