# Reentrada rápida (5 minutos)

## 1) Último objetivo trabajado
- HU5: Fastify–Python contract for email suggestions
  - Added `/api/v1/suggestions` as an authenticated Fastify route.
  - Added Jest contract tests for suggestions and notifications routes.
  - Confirmed emailSuggester integration and classifier fallback behaviour.

## 2) Próxima tarea recomendada (≤ 90 min)
- Kick off HU6: React suggestions panel.
  - Consume `/api/v1/suggestions` from the frontend.
  - Render suggested actions (action/category/confidence_score) per email.
  - Keep all destructive actions manual (no auto-delete) while iterating on UX.

## 3) Comandos de arranque

```bash
npm install
npm test        # Run backend contract and service tests
npm run dev     # Fastify backend on http://localhost:3000
# Frontend: start according to the main README instructions
```

4) Endpoints a verificar rápido
GET /api/v1/notifications/summary

GET /api/v1/notifications/history

GET /api/v1/suggestions

Con eso, si te vas una semana, en 5 minutos recuerdas:

- “Ah, HU5 ya está; sigue React HU6 y el contrato ya está probado.”
