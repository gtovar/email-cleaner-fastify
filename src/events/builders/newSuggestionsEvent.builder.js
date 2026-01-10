// src/events/builders/newSuggestionsEvent.builder.js

import { DOMAIN_EVENTS } from "../eventBus.js";

/**
 * DOMAIN_EVENTS.SUGGESTIONS_GENERATED 
 *
 * Este evento representa que se han generado sugerencias de acciones
 * sobre correos para un usuario.
 *
 * PROPÓSITO:
 * - Notificar al sistema (UI, notificaciones, automatizaciones)
 *   que hay trabajo sugerido pendiente.
 *
 * CONTRATO DEL EVENTO:
 * El objeto devuelto por buildNewSuggestionsEvent SIEMPRE contiene:
 *
 * - type: Identificador del evento (DOMAIN_EVENTS.SUGGESTIONS_GENERATED)
 * - userId: Usuario al que pertenecen las sugerencias
 * - suggestions: Lista completa de sugerencias generadas (input original)
 * - summary.totalSuggestions: Número total de acciones sugeridas
 * - summary.sampledEmails: Muestra pequeña para preview/notificaciones
 * - generatedAt: Momento lógico en que se generó el evento
 * - createdAt / updatedAt: Timestamps de persistencia
 *
 * NOTAS DE DISEÑO:
 * - Este evento es autocontenible: incluye detalle + resumen.
 * - summary existe para evitar que consumidores recalculen conteos.
 *
 * buildNewSuggestionsEvent
 * Construye un evento estructurado indicando que hay nuevas sugerencias.
 *
 * Firma:
 *   buildNewSuggestionsEvent({ userId, suggestions })
 *
 * Devuelve un objeto "event" con:
 *   event.type
 *   event.userId
 *   event.suggestions            <-- tu test lo exige
 *   event.summary.totalSuggestions
 *   event.summary.sampledEmails
 *   event.generatedAt
 *   event.createdAt
 *   event.updatedAt
 */
export function buildNewSuggestionsEvent({ userId, suggestions }) {
  // Tu test exige que lance error si falta userId y que el mensaje incluya "userId"
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId is required to build a suggestions event');
  }

  const normalizedSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const nowIso = new Date().toISOString();

  // totalSuggestions = suma de la cantidad de sugerencias por email
  const totalSuggestions = normalizedSuggestions.reduce(
    (acc, item) =>
    acc + (Array.isArray(item?.suggestions) ? item.suggestions.length : 0),
    0
  );

  const actionCounts = {};
  const clasificacionCounts = {};

  for (const item of normalizedSuggestions) {
    const list = Array.isArray(item?.suggestions) ? item.suggestions : [];
    for (const suggestion of list) {
      const action = typeof suggestion === 'string'
        ? suggestion
        : String(suggestion?.action ?? 'unknown');
      const clasificacion = typeof suggestion === 'object' && suggestion !== null
        ? String(suggestion?.clasificacion ?? suggestion?.category ?? 'unknown')
        : 'unknown';

      actionCounts[action] = (actionCounts[action] ?? 0) + 1;
      clasificacionCounts[clasificacion] = (clasificacionCounts[clasificacion] ?? 0) + 1;
    }
  }

  // sampledEmails = muestra pequeña (máx 3 emails) con máx 3 suggestions por email
  // OJO: esto es una decisión de diseño: “evento ligero”
  const sampledEmails = normalizedSuggestions
    .slice(0, 3)
    .map((item) => ({
      emailId: String(item?.id ?? item?.emailId ?? ''),
      subject: item?.subject ?? '',
      suggestions: Array.isArray(item?.suggestions)
      ? item.suggestions.slice(0, 3)
      : [],
    }));

  return {
    type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
    userId,

    // IMPORTANTE: tu test pide "suggestions" como propiedad directa del event
    suggestions: normalizedSuggestions,

    summary: {
      totalSuggestions,
      actionCounts,
      clasificacionCounts,
      sampledEmails,
    },

    generatedAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}
