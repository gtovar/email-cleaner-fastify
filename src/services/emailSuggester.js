// src/services/emailSuggester.js

/**
 * Lógica para sugerir acciones automáticas sobre correos electrónicos.
 * Extensible para reglas personalizadas y ML en el futuro.
 */

export const SUGGESTION_LABELS = {
  DELETE:    'suggested-delete',
  ARCHIVE:   'suggested-archive',
  MOVE_BIG:  'suggested-move-big-attachments'
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
