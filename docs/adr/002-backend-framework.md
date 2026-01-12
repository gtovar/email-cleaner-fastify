# ADR 002: Backend framework choice

- Status: accepted
- Date: 2025-10-21

## Context
The project initially explored Fastify, but some early experiments used Express. A single official backend framework was required.

## Decision
Fastify is the official backend framework. Express is archived.

## Consequences
- Better performance and lower overhead.
- Plugin and hook system aligned with project architecture.
- Requires migration of any legacy Express code.
