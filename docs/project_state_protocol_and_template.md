# 1. Technical Header (Snapshot Metadata)

PROJECT_NAME: Email Cleaner & Smart Notifications
SNAPSHOT_DATE: <YYYY-MM-DD HH:MM CST>
AUTHOR: <Gilberto / ChatGPT>
COMMIT: <short-hash or "pending">
ENVIRONMENT: <local / develop / main / feature/…>

# Notes:
# - SNAPSHOT_DATE must reflect the exact moment the document was updated.
# - COMMIT must reference the commit that triggered this update. If the update is purely documental, use "pending" or "none".
# - ENVIRONMENT must match the branch or context used to verify the state.

## 2. Executive Summary

This snapshot reflects the real, verifiable state of the system at commit <hash>.

Current status:
- What works today: <fill with facts only>
- Active components: <backend / ML / frontend / db / n8n>
- Stable elements: <endpoints, flows, infrastructure verified>
- Known degradations or instability: <if any>

# Rules:
# - This must be short (5–7 lines).
# - No opinions, no plans, no future ideas.
# - Only facts confirmed by code, tests, or infra.

## 3. Component-by-Component Technical State

### 3.1 Fastify Backend
- Code present: <files, routes, services found>
- Working endpoints: <list>
- Passing tests: <yes/no, test files>
- Infra status: <docker ok / local only / disabled>

### 3.2 ML Microservice (FastAPI)
- Code present:
- Active routes:
- Fallback behavior:
- Tests present:

### 3.3 React Frontend
- Code present:
- Working screens:
- Connected to backend:
- Tests:

### 3.4 PostgreSQL Database
- Models detected:
- Migrations:
- Relations:
- Active through docker:

### 3.5 n8n (optional)
- Exists: yes/no
- Workflows present:
- Connected components:

### 3.6 Docker Infrastructure
- docker-compose services active:
- Makefile commands verified:
- env files required:

# Rules:
# - Each bullet MUST be backed by code in the repo.
# - No hypothetical features.
# - No text like "should", "planned", or "idea".

## 4. User Story Status (Evidence-Driven)

### HUXX — <title>
STATUS: <DONE | IN_PROGRESS | BLOCKED | BACKLOG>

EVIDENCE:
- <files, endpoints, tests, commits>

PENDING:
- <only real missing technical items>

RISKS:
- <actual technical risks>

DECISION:
- <1–2 lines: why the state changed>

# Rules:
# - No narratives.
# - No percentages ("90% done" is forbidden).
# - Evidence must exist in code. If not found, remove it.

## 5. Current Technical Risks

- <Security issues>
- <Architecture inconsistencies>
- <Infra failure points>
- <Test gaps>
- <Contract mismatch>

Rules:
- Only REAL risks found in code or infra.
- No speculative or hypothetical risks.

## 6. Next Immediate Action

➡️ <one single step executable in 5–15 minutes>

Rules:
- Only ONE step.
- Must be realistic and technical.
- Cannot be a plan, cannot be a list.
- This is the anchor for reentry after pauses.







# 2. Reglas para Mantener y Actualizar PROJECT_STATE.md (Backend Fastify)

Estas reglas aplican exclusivamente al repositorio del backend Fastify.  
Describen cómo y cuándo debe actualizarse este archivo.

---

## 2.1. Cuándo se debe actualizar PROJECT_STATE.md

El archivo debe actualizarse únicamente en estos casos:

1. Cuando una HU cambia de estado  
   (ejemplo: EN_CURSO → DONE).

2. Cuando la arquitectura cambia realmente:  
   - cambios en rutas  
   - cambios en servicios  
   - cambios en contratos Fastify ↔ Python  
   - nuevos contenedores  
   - archivos nuevos o renombrados

3. Cuando un test crítico modifica el estado del proyecto:  
   - algo que antes pasaba ahora falla  
   - algo que no existía ahora sí existe

4. Cuando se agrega un componente técnico real:  
   - nuevo servicio Python  
   - nuevo endpoint  
   - nueva pieza de infraestructura

Este archivo nunca debe actualizarse por ideas, especulaciones, planes futuros o discusiones.  
Solo refleja la realidad técnica verificada del commit actual.

---

## 2.2. Quién debe editarlo y cómo

- Solo puede ser editado por Gilberto o por ChatGPT.  
- Debe actualizarse a partir del código, no de la memoria.  
- Solo se escribe información con evidencia verificable en:  
  - archivos reales del repositorio  
  - tests existentes  
  - rutas activas  
  - docker-compose  
  - logs de ejecución  
- No se permiten frases como “creemos”, “recordamos” o “posiblemente”.

---

## 2.3. Reglas de consistencia obligatorias

**Regla 1 — Cada actualización debe registrar:**
- Fecha  
- Autor  
- Commit  
- Componentes modificados

**Regla 2 — Separar siempre:**
- Hechos  
- Pendientes  
- Riesgos técnicos  
- Decisiones tomadas  

No se mezclan.

**Regla 3 — Cada HU debe tener evidencia real:**  
Solo se permiten:
- archivos existentes  
- tests  
- rutas activas  
- capturas/logs  
- código verificado  

No se permite:
- “HU5 casi lista”  
- “HU6 puede estar terminada”

Si no está en el repo, no se escribe.

**Regla 4 — Prohibido incluir:**
- planes  
- backlog  
- brainstorming  
- metas del sprint  
- recordatorios  
- discusiones

Todo eso vive en:
- Scrum.md  
- Reentry.md  
- Sprint_Log.md  
No aquí.

---

## 2.4. Reglas sobre el lenguaje

El texto debe cumplir:

- Sin “creo”, “podría”, “debería”.  
- Sin frases largas.  
- Oraciones cortas, técnicas y directas.  
- Sin humor ni metáforas.  
- Tono: auditoría técnica + arquitectura + registro objetivo.

---

## 2.5. Regla de sincronización con el repositorio

Antes de modificar este archivo:

1. Se debe leer todo el repositorio real.  
2. Comparar rutas, servicios, contratos, tests y estructura.  
3. Actualizar solo si hay cambios reales.  
4. Si no hubo cambios, no se toca el archivo.

Esto evita documentación contradictoria o inventada.

---

## 2.6. Regla de snapshot

Cada edición del archivo es un snapshot completo del estado del proyecto.

- Cada snapshot debe ser integral, no parcial.  
- No se escribe “solo lo nuevo del día”.  
- Se reescribe el estado completo para evitar contradicciones.  
- Las versiones anteriores deben guardarse en `project_docs_history`.

---

## 2.7. Regla del “Próximo paso único”

Cada snapshot debe terminar con:

**Next Immediate Step:**  
\<una sola acción real ejecutable en 5–15 minutos\>

No se permiten listas.  
Un solo paso asegura foco técnico.

---

# 3. Estándar para Historias de Usuario dentro de PROJECT_STATE.md

Esta sección establece el formato único, fijo y obligatorio que TODAS las HU deben seguir dentro del PROJECT_STATE.md del backend Fastify.

Su propósito es eliminar:
- HU sin evidencia
- HU cambiando de estado sin explicación
- HU narrativas o subjetivas
- HU inconsistentes entre documentos
- HU dependientes de memoria o interpretación

---

## 3.1. Formato obligatorio por HU

Cada HU debe aparecer EXACTAMENTE con esta estructura:

### HUXX — <nombre>

**Estado:** <DONE | EN_CURSO | BLOCKED | BACKLOG>

**Evidencia comprobable:**
- (archivos, rutas, modelos, servicios, tests; TODO debe existir en el repositorio)

**Pendientes (reales):**
- (solo tareas técnicas que realmente faltan en el código actual)

**Riesgos técnicos:**
- (solo riesgos objetivos derivados del código real)

**Decisión o cambio reciente:**
- (explicar en 1–2 líneas por qué cambió el estado)

Nada más.  
Nada menos.

---

## 3.2. Reglas obligatorias por subsección

### ✔ Estado
El estado debe ser uno de los valores fijos:
- DONE
- EN_CURSO
- BLOCKED
- BACKLOG

No se permiten variaciones como:
- “casi lista”
- “90%”
- “funcional pero falta revisar”
- “conceptualmente terminada”

### ✔ Evidencia comprobable
La evidencia debe ser técnica y verificable:
- rutas reales
- archivos existentes
- servicios implementados
- modelos presentes
- tests en verde
- capturas o logs válidos
- comportamiento confirmado vía docker-compose

No se permite:
- suposiciones
- intenciones
- deseos
- frases como “debería funcionar”
- “se supone que…”

### ✔ Pendientes
Solo tareas técnicas reales:
- falta test específico
- falta manejo de errores
- falta paginación
- falta validación de payload
- falta contrato actualizado con el ML

No se permite:
- “mejorar UI”
- “refactorizar si da tiempo”
- “analizar alternativas”
- “planear siguiente versión”

### ✔ Riesgos técnicos
Solo riesgos con evidencia real:
- endpoint depende de contrato inestable
- servicio sin validación
- falta de mocks en tests
- dependencia externa sin timeout

No se permite:
- riesgos psicológicos
- riesgos organizacionales
- riesgos especulativos

### ✔ Decisión o cambio reciente
Debe ser una línea, clara y técnica:
- “Pasó a DONE tras validar tests en notifications.test.js”
- “Regresó a EN_CURSO por cambio en el schema del endpoint /suggestions”
- “Marcada como BLOCKED debido a dependencia externa”

No narrativa.  
No historia.  
No explicaciones largas.

---

## 3.3. Ejemplo sintético del formato final

### HU3 — Notificaciones

**Estado:** DONE

**Evidencia comprobable:**
- Rutas: `/api/v1/notifications/{summary,confirm,history}`
- Modelos: `Notification.js`, `ActionHistory.js`
- Tests: `notifications.test.js` en verde
- DB: inserciones y lecturas verificadas en logs

**Pendientes:**
- Ninguno

**Riesgos técnicos:**
- Ninguno

**Decisión o cambio reciente:**
- Marcada como DONE tras validar rutas, tests y persistencia en DB.

---

## 3.4. Reglas de presentación visual

- Todo en viñetas cortas.
- No usar párrafos largos.
- Ningún emoji dentro de PROJECT_STATE.md.
- No colores, no decoraciones.
- No texto subjetivo.
- Cada línea debe ser verificable.

---

## 3.5. Regla del “estado no negociable”

Si una HU aparece en otro documento (Scrum, Reentry, Roadmap) con información distinta:

**La verdad oficial SIEMPRE es la versión en PROJECT_STATE.md.**

Esto elimina contradicciones internas y asegura consistencia.

---

# 3. Estándar para Historias de Usuario dentro de PROJECT_STATE.md

Esta sección establece el formato único, fijo y obligatorio que TODAS las HU deben seguir dentro del PROJECT_STATE.md del backend Fastify.

Su propósito es eliminar:
- HU sin evidencia
- HU cambiando de estado sin explicación
- HU narrativas o subjetivas
- HU inconsistentes entre documentos
- HU dependientes de memoria o interpretación

---

## 3.1. Formato obligatorio por HU

Cada HU debe aparecer EXACTAMENTE con esta estructura:

### HUXX — <nombre>

**Estado:** <DONE | EN_CURSO | BLOCKED | BACKLOG>

**Evidencia comprobable:**
- (archivos, rutas, modelos, servicios, tests; TODO debe existir en el repositorio)

**Pendientes (reales):**
- (solo tareas técnicas que realmente faltan en el código actual)

**Riesgos técnicos:**
- (solo riesgos objetivos derivados del código real)

**Decisión o cambio reciente:**
- (explicar en 1–2 líneas por qué cambió el estado)

Nada más.  
Nada menos.

---

## 3.2. Reglas obligatorias por subsección

### ✔ Estado
El estado debe ser uno de los valores fijos:
- DONE
- EN_CURSO
- BLOCKED
- BACKLOG

No se permiten variaciones como:
- “casi lista”
- “90%”
- “funcional pero falta revisar”
- “conceptualmente terminada”

### ✔ Evidencia comprobable
La evidencia debe ser técnica y verificable:
- rutas reales
- archivos existentes
- servicios implementados
- modelos presentes
- tests en verde
- capturas o logs válidos
- comportamiento confirmado vía docker-compose

No se permite:
- suposiciones
- intenciones
- deseos
- frases como “debería funcionar”
- “se supone que…”

### ✔ Pendientes
Solo tareas técnicas reales:
- falta test específico
- falta manejo de errores
- falta paginación
- falta validación de payload
- falta contrato actualizado con el ML

No se permite:
- “mejorar UI”
- “refactorizar si da tiempo”
- “analizar alternativas”
- “planear siguiente versión”

### ✔ Riesgos técnicos
Solo riesgos con evidencia real:
- endpoint depende de contrato inestable
- servicio sin validación
- falta de mocks en tests
- dependencia externa sin timeout

No se permite:
- riesgos psicológicos
- riesgos organizacionales
- riesgos especulativos

### ✔ Decisión o cambio reciente
Debe ser una línea, clara y técnica:
- “Pasó a DONE tras validar tests en notifications.test.js”
- “Regresó a EN_CURSO por cambio en el schema del endpoint /suggestions”
- “Marcada como BLOCKED debido a dependencia externa”

No narrativa.  
No historia.  
No explicaciones largas.

---

## 3.3. Ejemplo sintético del formato final

### HU3 — Notificaciones

**Estado:** DONE

**Evidencia comprobable:**
- Rutas: `/api/v1/notifications/{summary,confirm,history}`
- Modelos: `Notification.js`, `ActionHistory.js`
- Tests: `notifications.test.js` en verde
- DB: inserciones y lecturas verificadas en logs

**Pendientes:**
- Ninguno

**Riesgos técnicos:**
- Ninguno

**Decisión o cambio reciente:**
- Marcada como DONE tras validar rutas, tests y persistencia en DB.

---

## 3.4. Reglas de presentación visual

- Todo en viñetas cortas.
- No usar párrafos largos.
- Ningún emoji dentro de PROJECT_STATE.md.
- No colores, no decoraciones.
- No texto subjetivo.
- Cada línea debe ser verificable.

---

## 3.5. Regla del “estado no negociable”

Si una HU aparece en otro documento (Scrum, Reentry, Roadmap) con información distinta:

**La verdad oficial SIEMPRE es la versión en PROJECT_STATE.md.**

Esto elimina contradicciones internas y asegura consistencia.

---
# 4. Reglas estrictas sobre qué NO va en PROJECT_STATE.md

Esta sección define de manera explícita lo que está prohibido incluir dentro de este archivo.  
El objetivo es preservar su utilidad como snapshot técnico limpio y evitar que se convierta en historia, discusión o documentación extendida.

---

## 4.1. No lleva código

- El código vive únicamente en los archivos del repositorio.  
- Si una HU implicó cambios reales, aquí solo se documenta el resultado técnico:  
  “Se modificó <archivo> para implementar <comportamiento>”.  
- Los detalles específicos (líneas, diffs, bloques) pertenecen a:  
  - el commit correspondiente  
  - el PR  
  - el diff del repositorio  
- No deben copiarse funciones, fragmentos o ejemplos dentro de PROJECT_STATE.md.

---

## 4.2. No lleva discusiones largas

Cualquier discusión, lluvia de ideas o exploración va en:
- `SPRINT_LOG.md`  
- conversaciones con ChatGPT  
- documentos de arquitectura  
- decision_records (si se activan en el futuro)

En PROJECT_STATE.md únicamente se registra:
- qué se decidió  
- qué se hizo  
- qué sigue

No se incluyen explicaciones extensas, argumentos ni narrativas.

---

## 4.3. No lleva pasos reproducibles completos

Las instrucciones de instalación, ejecución o despliegue NO van aquí.  
Este archivo no explica comandos como:

- `docker compose up`  
- `npm test`  
- `npm run dev`  
- secuencias técnicas largas

Esos detalles pertenecen a:
- `README.md`  
- `SETUP.md`  
- `/ops`  
- documentación de infraestructura

En PROJECT_STATE.md solo se escribe:
“Setup completado (ver SETUP.md sección X)”.

---

## 4.4. No lleva historia antigua

Este archivo no es un changelog.  
No guarda historia completa ni acumulada.

Reglas:
- Solo refleja el estado presente del backend.  
- No se incluyen eventos de más de una semana atrás, salvo elementos no cerrados.  
- La historia real del proyecto vive en:  
  - Git  
  - commits  
  - SPRINT_LOG  
  - CHANGELOG (si se habilita)

PROJECT_STATE.md no arrastra pasado innecesario.

---

## 4.5. No lleva decisiones tentativas

Solo se documentan decisiones **confirmadas**.  
Si una decisión aún está en evaluación, va en:

- “Pendientes” dentro de la HU correspondiente  
o  
- SPRINT_LOG.md

No se permite registrar:
- hipótesis  
- alternativas  
- ideas  
- decisiones incompletas  
- evaluaciones sin resolver

Solo decisiones ya tomadas.

---
# 5. Reglas de actualización por cada Historia de Usuario (HU)

Cada HU debe reflejar su ciclo de vida completo dentro de PROJECT_STATE.md.  
Las reglas aplican sin importar tamaño, complejidad o tipo (backend, ML, integración, infraestructura).

---

## 5.1. Cuando una HU se crea

En el momento en que la HU existe, aunque no haya cambios de código:

**A) Estado actual:**  
Registrar la creación.  
Ejemplo:  
HU-12 Fastify ↔ Python Integration: creada, en análisis inicial.

**B) Siguiente paso:**  
Indicar el primer movimiento técnico:  
Definir alcance técnico y dependencias antes de escribir código.

No se registra “Última decisión tomada” porque nada se ha decidido aún.

---

## 5.2. Cuando una HU entra a ejecución

En el primer commit técnico relacionado:

**A) Estado actual:**  
Debe cambiar a:  
HU-12 Fastify ↔ Python Integration: en desarrollo.

**B) Última decisión tomada:**  
Registrar solo decisiones reales, no ideas exploradas.  
Ejemplo:  
La integración será vía HTTP local, no sockets.

**C) Siguiente paso:**  
Acción concreta y técnica.  
Ejemplo:  
Implementar endpoint /ml/classify y escribir pruebas.

---

## 5.3. Durante la ejecución (múltiples commits)

PROJECT_STATE.md no se actualiza con cada commit, solo con hitos reales.

Hitos válidos:
- pruebas unitarias listas  
- servicio conectado  
- respuestas reales verificadas  
- documentación técnica lista  
- error crítico diagnosticado

Reglas:
- Si existe una decisión → va en “Última decisión tomada”.  
- Si se completa un sub-hito → se actualiza “Estado actual”.  
- Si ya sabes lo que sigue → se actualiza “Siguiente paso”.

La idea es que, si el proyecto se pausa meses, PROJECT_STATE.md permita retomar en segundos.

---

## 5.4. Cuando la HU se completa

Normas obligatorias:

**A) Estado actual:**  
Debe ser:  
HU-12 Fastify ↔ Python Integration: completada.

**B) Última tarea completada:**  
Debe registrar explícitamente el cierre técnico:  
Integración Fastify → Python funcionando, con pruebas verdes.

**C) Siguiente paso:**  
No se asignan pasos a una HU cerrada.  
Se reemplaza por el siguiente movimiento global del proyecto.

**D) Registro del cierre:**  
Se agrega la entrada al bloque “Cierre de HU (última semana)”.

**E) No se vuelve a mover:**  
HU cerrada queda congelada.  
Cualquier ajuste futuro = nueva HU.

---

## 5.5. Cuando la HU se pausa

Caso común.

**A) Estado actual:**  
HU-12 Fastify ↔ Python Integration: pausada.

**B) Última tarea realizada:**  
Registrar el último avance real:  
Último avance: endpoint /notifications/history funcionando.

**C) Siguiente paso:**  
Una sola línea clara:  
Retomar revisión de logs del ML antes de reactivar.

Este bloque garantiza reentrada rápida al proyecto.

---

## 5.6. Cuando la HU se cancela

Si una HU se abandona:

Estado actual:  
HU-12 Fastify ↔ Python Integration: cancelada.

Motivo técnico corto:  
Duplicada por HU-15.

Nada más.  
Sin narrativa.  
Sin explicación extensa.

---
Secciónes normativas estas no son tecnicas igual que las secciones 2,3,4 y 5

# 6. Reglas de versionado interno y timestamps

Estas reglas definen cómo se registran los cambios, commits y ediciones dentro de PROJECT_STATE.md para mantenerlo siempre sincronizado con el estado real del backend Fastify.

---

## 6.1. Cada edición debe tener un timestamp real

Cada vez que se edita este archivo debe incluirse una línea:

_Last updated: YYYY-MM-DD HH:MM CST_

Reglas:
- Formato ISO-like (sin milisegundos).
- Fecha y hora reales.
- Siempre en CST.
- No se autogenera: lo escribe conscientemente el humano.
- Sirve para retomar el proyecto después de pausas largas.

---

## 6.2. Cada edición debe referenciar un commit real

Cada entrada relevante debe tener:

_Last change commit: <short-hash>_

Si la edición antecede al commit real:

_Last change commit: pending_

Luego de realizar el commit, se vuelve a este archivo y se reemplaza “pending” por el hash real.

---

## 6.3. Cada HU debe anclar decisiones a commits cuando corresponda

En la subsección “Decisión o cambio reciente” dentro de cada HU:

- Si la decisión deriva de código real:  
  `(commit: <short-hash>)`

- Si la decisión es conceptual, sin código:  
  `(commit: none – decisión conceptual)`

Nada queda ambiguo.  
Cada decisión debe estar vinculada explícitamente.

---

## 6.4. PROJECT_STATE.md nunca lleva más de un commit asociado a una misma edición

Cada edición documenta **solo un commit relevante**.

Si una sesión de trabajo produce tres commits distintos:
- Se realizan tres ediciones independientes.
- Cada edición debe tener su timestamp y su commit correspondiente.

No se agrupan commits dentro de un solo registro.

---

## 6.5. No hay versionado numérico interno

Este archivo no usa:
- v1.0.1  
- v2.4  
- ni ningún número de release

El versionado pertenece al repositorio, no a este documento.

En PROJECT_STATE.md solo importan:
- cuándo se cambió  
- por qué  
- y a qué commit corresponde  

---

## 6.6. Si una HU se edita sin commit, debe registrarse explícitamente

Ejemplos válidos:

Última edición: 2025-11-20 17:45 CST  
Última edición ligada a código: no — ajuste documental.

o

Última edición ligada a código: pendiente

Esto evita confusión sobre “código que no existe” o “código que no se ha escrito”.

---

## 6.7. No se usa autor en cada edición

No se escribe “Editado por Gilberto”.  
El repo (Git) ya registra la autoría.

PROJECT_STATE.md es un registro técnico de sincronización, no un historial de contribuciones humanas.

---

## 6.8. El bloque de versionado SIEMPRE va al final del archivo

Formato obligatorio:

---
## Version log

- YYYY-MM-DD HH:MM CST — <cambio realizado> (commit: <hash>)
- YYYY-MM-DD HH:MM CST — <cambio realizado> (commit: <hash>)
- YYYY-MM-DD HH:MM CST — <cambio realizado> (commit: pending | none)

Este bloque es histórico y **no se mezcla con las secciones superiores**.
Debe ser el último bloque del archivo.

# 7. Reglas de coherencia con Scrum.docx

Esta sección asegura que PROJECT_STATE.md se mantenga sincronizado con el proceso Scrum sin duplicarlo.  
Scrum define el flujo.  
PROJECT_STATE.md registra únicamente el estado técnico real.

---

## 7.1. Scrum.docx define cómo se cierra una HU — PROJECT_STATE.md documenta qué se cerró

Scrum.docx contiene:
- Criterios de aceptación  
- Definición de DONE  
- Flujo de ramas  
- Procedimiento formal para cerrar una HU  

PROJECT_STATE.md no repite ese proceso.  
Aquí solo se registra:
- HU-X está DONE  
- Qué commit lo respalda  
- Qué evidencia técnica lo demuestra  
- Razón técnica del cierre  

Scrum = manual.  
Project State = bitácora factual.

---

## 7.2. PROJECT_STATE.md no guarda “cómo debería ser Scrum”, solo aplica el proceso

Está prohibido registrar:
- “DONE según proceso Scrum”  
- “Cerrada siguiendo pasos de Scrum”  

En su lugar:

HU-12: DONE  
Commit: 71c5baf  
Evidencia: tests en verde, contrato ML estable  
Razón: ML ↔ Fastify funcionando

Scrum se cumple en silencio.  
No se narra dentro del archivo.

---

## 7.3. Si hay discrepancia entre ambos archivos, Scrum manda

Regla de autoridad:
- Para procesos → Scrum.docx  
- Para estados → PROJECT_STATE.md  
- Para arquitectura → Architecture.md  
- Para roadmap → Roadmap.docx  

Si existe contradicción sobre cómo se cierra una HU:  
**Scrum.docx manda.**  
PROJECT_STATE.md describe el hecho técnico, no la norma.

---

## 7.4. Nada de meter tareas, subtareas o sprints en PROJECT_STATE.md

Todo lo operativo vive en:
- Sprint_Log  
- Scrum.docx  
- Features & Roadmap  

PROJECT_STATE.md únicamente contiene:
- Estado actual  
- Riesgos reales  
- Próximo paso único  
- HU activa  
- HU cerradas  

Nunca listas de tareas ni ceremonias Scrum.

---

## 7.5. Cada HU en PROJECT_STATE.md debe tener exactamente uno de estos estados

Estados permitidos, coherentes con Scrum:
- Planned  
- In progress  
- Blocked  
- Review  
- Done  

Estados prohibidos:
- “Done conceptual”  
- “En curso pero casi”  
- “Implementada parcialmente”  

No existen en Scrum y no deben aparecer aquí.

---

## 7.6. El archivo no puede cambiar el estado de una HU sin commit o evidencia

Scrum define DONE como aceptación + evidencia.

PROJECT_STATE.md lo respeta:
Estado: Done  
Commit: 5eb32fa  
Evidencia: tests de integración ML en verde

Si falta evidencia → no se pasa a Done.  
Si el commit no existe todavía → queda como pending.

Evita crear estados falsos.

---

## 7.7. No se repiten definiciones del proceso dentro de PROJECT_STATE.md

Prohibido incluir:
- “DONE significa…”  
- “Una HU pasa a Review cuando…”  

Eso vive en Scrum.docx.  
PROJECT_STATE.md solo aplica las reglas, no las redefine.

---

## Resumen operativo

Scrum.docx = cómo trabajamos  
PROJECT_STATE.md = qué existe y qué pasó en el repositorio  

Nunca se duplican.  
Nunca se contradicen.  
Nunca se pisan.

# 8. Lista de prohibidos en PROJECT_STATE.md

Esta sección define explícitamente todo aquello que no puede aparecer en este archivo.  
El objetivo es mantener PROJECT_STATE.md como un snapshot técnico, limpio y verificable del backend Fastify.

---

## 8.1. Prohibido incluir emociones, opiniones o reflexiones personales

No se permite registrar:
- “Creo que esta HU ya casi está”
- “Siento que el backend está estable”
- “Me confundí con este módulo”
- “Tal vez deberíamos cambiar esta arquitectura”

Ese contenido pertenece a Sprint_Log o documentos de discusión.  
Aquí solo van hechos técnicos verificables.

---

## 8.2. Prohibido incluir tareas, subtareas, to-dos o listas de pendientes

Ejemplos prohibidos:
- Falta integrar botón X  
- Hacer migraciones  
- Ajustar flujo en frontend  

Todo eso va en:
- Sprint_Log  
- Roadmap  
- Features & Roadmap  
- Issues de GitHub

En PROJECT_STATE.md solo existe el “Próximo paso único”.

---

## 8.3. Prohibido incluir definiciones de proceso, tutoriales o instrucciones técnicas

Ejemplos prohibidos:
- “Para cerrar esta HU, revisa el PR…”
- “Para correr el backend, usa npm run dev…”
- “El proceso Scrum dice que…”

Ese material vive en:
- Scrum.docx  
- README_REENTRY  
- QUICKSTART  
- SETUP.md

PROJECT_STATE.md no es un manual.

---

## 8.4. Prohibido incluir listas largas de commits

No se deben registrar:
- Historial de commits
- Diffs
- Secuencias de cambios
- Hashes antiguos
- Descripciones por archivo

Solo se documenta **un commit relevante por HU**.  
Todo lo demás vive en Git.

---

## 8.5. Prohibido incluir notas temporales, debugging o errores de ejecución

Ejemplos prohibidos:
- Error en docker-compose
- El frontend no cargó
- npm test falló
- Logs incompletos o stack traces

Ese contenido pertenece a Sprint_Log o Issues.  
PROJECT_STATE.md solo refleja estado comprobado y estable.

---

## 8.6. Prohibido incluir roadmap o planificación

No deben aparecer:
- Prioridades
- Backlog
- Proyecciones futuras
- Línea de tiempo
- HUs aún no creadas

La única planificación permitida es:  
**El próximo paso único.**

---

## 8.7. Prohibido incluir ideas, propuestas o experimentos

Ejemplos prohibidos:
- Cambiar Fastify por NestJS  
- Usar Redis más adelante  
- Migrar a AWS Lambda  

Ese contenido corresponde a Roadmap o Architecture.md.  
PROJECT_STATE.md solo refleja la realidad actual del backend.

---

## 8.8. Prohibido incluir HUs que no existan en el código

Solo se registran HUs que tengan evidencia real:
- commits  
- archivos  
- tests  
- endpoints  
- modelos  

Si no existe en el repositorio, no entra en PROJECT_STATE.md.

---

## 8.9. Prohibido incluir capturas, logs o outputs de consola

No se deben pegar:
- Logs  
- Stack traces  
- Dumps  
- Capturas de pantalla  
- Outputs de debug  

Este archivo no es un contenedor de depuración.

---

## 8.10. Prohibido incluir decisiones arquitectónicas explicadas a detalle

Si una decisión se tomó, se registra así:
Decision: migración a ESM  
Reason: uniformidad backend + ML

Las explicaciones extensas viven en:
- Architecture.md  
- Decisions_Log.md

---

## Resumen sintético

Si no es:
- Estado actual  
- Hecho verificable  
- Riesgo activo  
- HU con commit real  
- Próximo paso único  
- Evidencia del repositorio  

**No pertenece a PROJECT_STATE.md.**

# 9. Final conventions for PROJECT_STATE.md

This section defines the universal style and consistency rules that must always be applied across the entire PROJECT_STATE.md.  
These conventions do not depend on the HU, the sprint, or the repository stage.  
They apply permanently.

---

## 9.1. Tone: formal, neutral, factual

The document must always be written:
- in third person  
- without opinions  
- without speculation  
- without emotions  
- without assumptions  
- without conditional language (“maybe”, “should”, “probably”)  

Correct tone:
“HU3 is completed. The endpoints exist, have tests, and were verified with curl.”

Incorrect tone:
“I think HU3 is almost done; it probably just needs a few more checks.”

---

## 9.2. Verb tenses: present or past with evidence

Allowed:
- “Exists…”  
- “Was validated…”  
- “Includes…”  
- “The backend exposes…”  

Not allowed:
- “Will probably include…”  
- “Should have…”  
- “We plan for it to…”  

PROJECT_STATE.md does not predict; it confirms.

---

## 9.3. Official timestamp

Each version of the file must include:

`Last updated: YYYY-MM-DD — Commit: <hash>`

Purpose:
- precise temporal reference  
- exact mapping to the repository state  

Example:
`Last updated: 2025-11-18 — Commit: a4f93c1`

---

## 9.4. Strict naming conventions: full and exact names

Every reference must use its exact, complete identifier:

- Files → `src/services/emailSuggester.js`  
- Endpoints → `/api/v1/notifications/history`  
- Environment variables → `ML_BASE_URL`  
- Branches → `feat/hu12-fastify-ml-integration`  
- Tests → `tests/suggestionsRoutes.test.js`  

Never write:
- “the suggester file”  
- “the history route”  
- “the microservice”  
- “the ML branch”  

Exact names = exact coordinates.

---

## 9.5. Block formatting rules

All sections must follow this structure:

**Section headers:**

3. User Story Status

*HU headers:**

HU12 — Fastify ↔ ML Integration (DONE)

**Bullet points:**
- Always use `-`  
- Never `•`, `*`, or other symbols  

**Code blocks:**
Use triple backticks:
ML_BASE_URL=http://localhost:8000


---

## 9.6. Single blank line between sections

A blank line must exist between major sections.  
This ensures clarity and prevents the file from becoming visually compressed.

---

## 9.7. Limited use of symbols and emojis

Allowed only in non-technical labels:
- ✔ for DONE  
- 🔄 for In Progress  
- ➡️ for Next Immediate Step  

Prohibited in technical contexts:
- endpoints  
- commits  
- file names  
- code  
- variables  
- branches  

Technical content must remain neutral and clean.

---

## 9.8. PROJECT_STATE.md is never signed

No author lines such as:
- “Document written by…”  
- “Edited by Gilberto…”  
- “Maintained by ChatGPT…”  

Git already tracks authorship.

---

## 9.9. Updates must be based on verified code only

Absolute rule:

No update may be written without checking:
- the real repository  
- the actual code  
- the tests  
- the endpoints  
- the docker-compose stack  

PROJECT_STATE.md reflects what is true, not what is assumed.

---

## 9.10. Internal consistency between sections

If a HU is marked as DONE:
- It must have a real commit  
- It must appear in the HU section  
- It must match the “Current State”  
- It must not appear in “Active Risks”  

If a HU is In Progress:
- It cannot appear as DONE elsewhere  
- It must not have a DONE commit  
- It must appear in risks if applicable  

Zero contradictions.

---

## 9.11. Language: always English

The entire PROJECT_STATE.md must be written in English.  
The only exceptions are names of external documents (e.g., Scrum.docx, Roadmap.docx).

---

## ✔️ SECCIÓN 10 — Integración con otros documentos del repositorio

*(versión completa, final, lista para pegar)*

Aquí está, limpia, coherente, técnica y en inglés (porque todas las reglas las estamos escribiendo en inglés salvo las explicaciones tuyas/mías):

---

# 10. Cross-document coherence rules

These rules ensure that `PROJECT_STATE.md` does not contradict, duplicate or override the other core documents of the backend repository.
Each document has a strict responsibility; violating these boundaries causes cognitive noise and desynchronization.

## 10.1. PROJECT_STATE.md is subordinate to technical truth, not planning documents

If a conflict exists between the state described in `PROJECT_STATE.md` and:

* `Scrum.docx`
* `Features & Roadmap.docx`
* `Sprint_Log.md`
* `README_REENTRY.md`

…then the rule is:

**Technical truth (the codebase) overrides everything.**

`PROJECT_STATE.md` mirrors the real repository, not intentions or plans.

## 10.2. PROJECT_STATE.md does not restate content from other documents

The state file must not copy or re-explain material that already lives in:

* `Scrum.docx` → process, ceremonies, acceptance flow
* `README_REENTRY.md` → how to resume work
* `Features & Roadmap.docx` → product vision and backlog
* `API_REFERENCE.md` → endpoint contracts
* `DESIGN_DOCUMENT.md` / `Architecture.md` → architectural justification
* `SETUP.md` → environment, installation, tools
* `docs/testing.md` → test runner and testing conventions

`PROJECT_STATE.md` only confirms what is true at this moment in the repo.

## 10.3. No forward-looking statements are allowed

Forbidden in PROJECT_STATE.md:

* future features
* planned architecture
* next sprints
* hypothetical improvements

All future-oriented content belongs to:

* `Features & Roadmap`
* `Sprint_Log`
* `Scrum Backlog`
* GitHub Issues

`PROJECT_STATE.md` is a snapshot, not a forecast.

## 10.4. PROJECT_STATE.md must not contradict API_REFERENCE.md

If API routes or contracts differ between both files:

* **API_REFERENCE.md wins**
* PROJECT_STATE.md must be corrected immediately

API_REFERENCE.md is the canonical interface definition.

## 10.5. PROJECT_STATE.md must remain the “single source of truth” for HU status

The status of each user story appears:

* as *process* status → `Scrum.docx`
* as *real technical completion status* → `PROJECT_STATE.md`

Whenever there is a conflict:

**PROJECT_STATE.md status wins.**

The repo reflects the technical reality.

## 10.6. PROJECT_STATE.md references other documents strictly by name and section

When referencing another document, the format must be:

```
See API_REFERENCE.md — Section 4.2
See SETUP.md — Environment Variables
See Scrum.docx — Definition of Done
```

Never paraphrase content.
Never embed content from other documents.

## 10.7. PROJECT_STATE.md does not store reusable scripts or procedures

Reusable scripts belong to:

* `/scripts/*.sh`
* `docs/setup`
* `README.md`

PROJECT_STATE.md can only include:
“Setup validated. See SETUP.md.”

## 10.8. PROJECT_STATE.md never contains duplicates of historical entries

A HU must appear **only once**, and only in its current state.
Historical evolution lives in:

* Git history
* `Sprint_Log.md`
* Version Log (at the bottom of PROJECT_STATE.md)


