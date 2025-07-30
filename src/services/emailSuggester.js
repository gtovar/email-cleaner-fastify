// src/services/emailSuggester.js

import fetch from 'node-fetch'; // o usa globalThis.fetch si estás en Node 18+

const CLASSIFIER_URL = 'http://127.0.0.1:5055/suggest';

/**
 * Llama al microservicio Python para obtener sugerencias.
 * @param {Array<Object>} emails - Lista de correos con metadatos.
 * @returns {Object} - Objeto con clave "emails" y lista de correos con sugerencias.
 */
export async function suggestActions(emails) {
  try {
    const response = await fetch(CLASSIFIER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emails)
    });

    if (!response.ok) {
      throw new Error(`Clasificador Python falló: ${response.status}`);
    }

    const suggestionMap = await response.json();

    console.log("📬 MAPA DE RESPUESTA ↓↓↓");
    console.dir(suggestionMap, { depth: null });

    // 💡 NUEVO: Log de tipos para depurar malformaciones
    console.log("✅ Tipado original de sugerencias:");
    for (const [id, suggestions] of Object.entries(suggestionMap)) {
      console.log(id, '→', Array.isArray(suggestions) ? suggestions.map(s => typeof s) : typeof suggestions);
    }

    // Enriquecer cada email con sus sugerencias, parseando si vienen mal
    const enriched = emails.map(email => {
      let suggestions = suggestionMap[email.id] || [];

      if (Array.isArray(suggestions)) {
        suggestions = suggestions.map(s => {
          if (typeof s === 'string') {
            try {
              s = JSON.parse(s);
            } catch (err) {
              console.warn(`❌ No se pudo parsear la sugerencia malformada para ${email.id}:`, s);
              return null;
            }
          }

          return {
            action: s?.action || '',
            category: s?.category || '',
            confidence_score: s?.confidence_score || 0
          };
        }).filter(Boolean); // elimina nulls
      } else {
        suggestions = [];
      }

      console.log(`🔍 Enriquecido: ${email.id} →`, suggestions);
      return {
        ...email,
        suggestions
      };
    });

    return { emails: enriched };

  } catch (err) {
    console.error('Error llamando al clasificador:', err);

    return {
      emails: emails.map(email => ({
        ...email,
        suggestions: []
      }))
    };
  }
}
