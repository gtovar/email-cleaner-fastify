# Reentrada rápida (5 minutos)

Este documento permite retomar el proyecto en cualquier momento, incluso después de días o semanas.

## 1) Último objetivo trabajado
- HU3: Notificaciones — pruebas, migraciones y validación de endpoints.

## 2) Próxima tarea recomendada (≤ 90 min)
- Finalizar pruebas del endpoint `/notifications/confirm` en `notifications.test.js`.

## 3) Comandos de arranque

```bash
make up
````

Servicios:

* Backend Fastify: [http://localhost:3000/health](http://localhost:3000/health)
* Frontend React: [http://localhost:5173](http://localhost:5173)
* ML Python (si aplica): [http://localhost:8000/docs](http://localhost:8000/docs)

## 4) Verificación rápida

* `/api/v1/notifications/summary` responde.
* `/api/v1/notifications/history` responde.
* Frontend compila sin errores.

## 5) Cierre del bloque

* Ejecutar `npm test`
* Actualizar `PROJECT_STATE.md`
* Registrar avance en `Sprint_Log.md`

```
Actualizar README_REENTRY.md (además de la frase que pusiste)

Dejar clarísimo, por ejemplo:

Última HU cerrada: HU3.

Rama principal: main.

Próximo objetivo: HU11 (tests con Jest).

Referencia cruzada a PROJECT_STATE.md y Sprint_log.md.
