# ADR 003: Adopción de Jest como Test Runner


- Archivo: `docs/adr/003-adoption-jest.md`.  
- Status: `accepted`.  
- Fecha: `2025-11-14`.  
- Describe claramente contexto, decisión (scripts, migración de node:test a Jest), pros y contras.   

 **Conclusión**:  
- Este criterio está **cumplidísimo** y además muy vendible en entrevista.

## Contexto

El proyecto utilizaba inicialmente el runner nativo `node:test` para las pruebas unitarias.  Aunque ligero, `node:test` carece de algunas funcionalidades (mocks, spies, snapshots y cobertura integrada) que se consideran estándar en proyectos Node.js profesionales.  A medida que el repositorio crece (backend en Fastify, microservicio en Python, interfaz en React), es conveniente adoptar un motor de pruebas más expresivo y reconocido.

## Decisión

Se adopta [Jest](https://jestjs.io/) como test runner principal.  La migración implica:

- Añadir `jest` como dependencia de desarrollo.
- Modificar los scripts npm:
  - `"test": "jest"` para ejecutar la suite.
  - `"test:watch": "jest --watch"` para modo observador.
  - `"coverage": "jest --coverage"` para reportes de cobertura.
- Configurar Jest en el `package.json` para soportar ECMAScript modules (`extensionsToTreatAsEsm`) y usar el entorno de pruebas de Node.
- Migrar las pruebas existentes de `node:test` a Jest, sustituyendo las aserciones de `assert` por llamadas a `expect()`.
- Documentar la ejecución de pruebas en `docs/testing.md` y actualizar el README.

## Consecuencias

### Pros

- **Experiencia de testing enriquecida**: Jest incluye mocks, espías y snapshots.
- **Cobertura integrada**: facilita evaluar la calidad de la suite.
- **Reconocimiento en la industria**: muchos equipos y reclutadores lo consideran un estándar.
- **Escalabilidad**: permite configurar distintos entornos y transformaciones según crezca el proyecto.

### Contras

- **Dependencia adicional**: se añade una nueva dependencia de desarrollo.
- **Configuración para ESM**: requiere una ligera configuración para funcionar con módulos ECMAScript.
- **Menor velocidad**: Jest puede ejecutar las pruebas un poco más lento que el runner nativo.

## Estado

Aceptada.  Las tareas de migración se gestionan en la HU11 del roadmap.

