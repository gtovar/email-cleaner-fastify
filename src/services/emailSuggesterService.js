// src/services/emailSuggesterService.js
// Servicio de alto nivel para pedir sugerencias de acción al microservicio de ML.
//
// Responsabilidad:
// - Recibir una lista de correos normalizados desde el backend.
// - Llamar al microservicio de ML (vía mlClient).
// - Enriquecer cada correo con un arreglo de "suggestions" normalizadas.
// - En caso de error, devolver los correos con suggestions vacías (fallback seguro).

import { classifyEmails } from './mlClient.js';

/**
 * Normaliza la estructura global devuelta por el microservicio de ML.
 *
 * Acepta:
 * - Un arreglo de objetos devueltos por ML: [{ id, suggestions }, ...]
 * - Un objeto directamente de la forma { [emailId]: suggestions[] }
 * - Un objeto con la forma { suggestionsById: { ... } }
 *
 * @param {any} raw
 * @returns {Record<string, unknown[]>}
 */
function normalizeSuggestionMap(raw) {
  if (!raw) {
    return {};
  }

  // Caso 1: el microservicio devuelve directamente una lista de correos enriquecidos
  // [{ id, ..., suggestions: [...] }, ...]
  if (Array.isArray(raw)) {
    const map = {};

    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;

      const emailId = String(item.id ?? '');
      if (!emailId) continue;

      const suggestions = Array.isArray(item.suggestions)
        ? item.suggestions
        : [];

      map[emailId] = suggestions;
    }

    return map;
  }

  if (
    typeof raw === 'object' &&
    raw !== null &&
    !Array.isArray(raw) &&
    typeof raw.suggestionsById === 'object' &&
    raw.suggestionsById !== null
  ) {
    return raw.suggestionsById;
  }

  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return raw;
  }

  return {};
}

/**
 * Normaliza una lista de sugerencias para un email.
 *
 * Acepta:
 * - Arreglos de strings (se intentan parsear como JSON y si no, se envuelven como { action: string }).
 * - Arreglos de objetos (se devuelven tal cual).
 * - Valores primitivos (se convierten en { action: String(valor) }).
 *
 * @param {unknown} list
 * @returns {Array<Record<string, unknown>>}
 */
function normalizeSuggestionList(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((s) => {
    if (typeof s === 'string') {
      try {
        const parsed = JSON.parse(s);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      } catch {
        // ignoramos error y seguimos al fallback
      }

      return { action: s };
    }

    if (typeof s === 'object' && s !== null) {
      return s;
    }

    return { action: String(s) };
  });
}

/**
 * Llama al microservicio Python para obtener sugerencias de acción
 * sobre una lista de correos.
 *
 * @param {Array<Record<string, unknown>>} emails - Lista de correos con metadatos (id, subject, etc.).
 * @returns {Promise<{ emails: Array<Record<string, unknown>> }>}
 */
export async function suggestActions(emails) {
  if (!Array.isArray(emails)) {
    throw new TypeError('suggestActions: "emails" must be an array');
  }

  const timeoutMs = Number(process.env.ML_TIMEOUT_MS || '5000');

  try {
    // Llamamos al cliente HTTP especializado.
    const raw = await classifyEmails(emails, { timeoutMs });

    const suggestionMap = normalizeSuggestionMap(raw);

    const enriched = emails.map((email) => {
      const emailId = String(email.id ?? '');
      const rawSuggestions = suggestionMap[emailId] ?? [];
      const suggestions = normalizeSuggestionList(rawSuggestions);

      return {
        ...email,
        suggestions
      };
    });

    return { emails: enriched };
  } catch (err) {
    // En caso de error, no rompemos el flujo del backend:
    // devolvemos los correos originales con suggestions vacías.
    // El error queda registrado en logs para diagnóstico.
    // eslint-disable-next-line no-console
    console.error('Error llamando al clasificador ML:', err);

    return {
      emails: emails.map((email) => ({
        ...email,
        suggestions: []
      }))
    };
  }
}

