// src/services/notificationsEventsBuilder.js (nombre ejemplo)
export const NEW_SUGGESTIONS_EVENT = "NEW_SUGGESTIONS_AVAILABLE";

export function buildNewSuggestionsEvent({ userId, suggestions }) {
  const list = Array.isArray(suggestions) ? suggestions : [];
  const count = list.length;

  const sample = list.slice(0, 3).map((s) => ({
    id: s.id,
    subject: s.subject,
    from: s.from,
  }));

  return {
    type: NEW_SUGGESTIONS_EVENT,
    userId,
    summary: {
      count,
      sample,
    },
    createdAt: new Date().toISOString(),
  };
}
