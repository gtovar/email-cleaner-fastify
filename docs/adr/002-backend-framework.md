# ADR 002: Elección de Framework Backend

* Status: accepted
* Date: 2025-10-21

## Contexto

El proyecto inició explorando Fastify, pero algunas implementaciones iniciales se hicieron en Express. Se requiere consolidar una opción oficial.

## Decisión

Fastify será el framework backend oficial.
Express queda archivado.

## Consecuencias

* Mejor rendimiento y menor overhead.
* Plugins y hooks avanzados.

- Requiere ajustar middlewares y estructura previa.
