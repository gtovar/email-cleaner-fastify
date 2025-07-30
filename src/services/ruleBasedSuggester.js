// src/services/ruleBasedSuggester.js

/**
 * Lógica para sugerir acciones automáticas sobre correos electrónicos.
 * Extensible para reglas personalizadas y ML en el futuro.
 * ⚠️ DEPRECADO: Este archivo representa el sistema de reglas manuales antes de migrar a Python.
 * Se conserva como fallback y para fines comparativos.
 */

export const SUGGESTION_LABELS = {
  DELETE:    'suggested-delete',
  ARCHIVE:   'suggested-archive',
  MOVE_BIG:  'suggested-move-big-attachments',
  REVIEW:    'suggested-review-recent'   // <- NUEVA etiqueta temporal
};

/**
 * Sugerencias según reglas básicas.
 * @param {Array<Object>} emails - Lista de correos.
 * @returns {Array<Object>} - Correos con sugerencias.
 */
export function suggestActions(emails) {
  const now = new Date();

  return emails.map(email => {
    const suggestions = [];

    // No leído y >1 año
    if (!email.isRead && monthsAgo(email.date, now) >= 12) {
      suggestions.push(SUGGESTION_LABELS.DELETE);
    }
    // Promociones viejas
    if (email.category === 'promotions' && monthsAgo(email.date, now) >= 6) {
      suggestions.push(SUGGESTION_LABELS.ARCHIVE);
    }
    // Adjunto grande y viejo
    if (email.attachmentSizeMb > 10 && monthsAgo(email.date, now) >= 12) {
      suggestions.push(SUGGESTION_LABELS.MOVE_BIG);
    }
    // NUEVA: todos los correos recientes (últimos 3 días)
    if (daysAgo(email.date, now) <= 3) {
      suggestions.push(SUGGESTION_LABELS.REVIEW);
    }

    return {
      ...email,
      suggestions
    };
  });
}

function monthsAgo(date, now) {
  const d = new Date(date);
  return (
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth())
  );
}

function daysAgo(date, now) {
  const d = new Date(date);
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}
