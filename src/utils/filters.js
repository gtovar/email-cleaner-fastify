// src/utils/filters.js
function buildGmailQuery(filters) {
  let q = '';
  if (filters.unread === 'true') q += ' is:unread';
  if (filters.category) q += ` category:${filters.category}`;
  if (filters.olderThan) q += ` older_than:${filters.olderThan}`;
  // Más reglas...
  return q.trim();
}

async function filterByAttachment(messages, gmail, auth) {
  // Requiere llamadas adicionales para revisar adjuntos
  const result = [];
  for (const msg of messages) {
    const { data } = await gmail.users.messages.get({ userId: 'me', id: msg.id });
    if (data.payload && data.payload.parts) {
      const hasAttachment = data.payload.parts.some(
        part => part.filename && part.body.attachmentId
      );
      if (hasAttachment) result.push(msg);
    }
  }
  return result;
}

module.exports = { buildGmailQuery, filterByAttachment };
