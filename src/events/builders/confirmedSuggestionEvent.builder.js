// src/events/builders/confirmedSuggestionEvent.builder.js
import { DOMAIN_EVENTS } from "../eventBus.js";

/**
 * Construye evento de confirmación de sugerencias.
 * Incluye resumen mínimo para quienes persisten/registran eventos.
 */
export function buildConfirmedSuggestionEvent({ userId, emailIds = [], action }) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId is required to build a confirmed suggestion event');
  }

  const normalizedEmailIds = Array.isArray(emailIds)
    ? emailIds.filter(Boolean).map((id) => String(id))
    : [];
  const nowIso = new Date().toISOString();

  return {
    type: DOMAIN_EVENTS.SUGGESTION_CONFIRMED,
    userId,
    action: action ?? null,
    emailIds: normalizedEmailIds,
    summary: {
      totalConfirmed: normalizedEmailIds.length,
      action: action ?? null,
    },
    generatedAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}
