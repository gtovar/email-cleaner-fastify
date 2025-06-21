// src/services/gmailService.js

class GmailService {
  constructor(gmailClient) {
    this.gmail = gmailClient;
  }

  /**
   * Lista mensajes con filtros personalizados de Gmail.
   * @param {Object} options - Opciones de filtrado.
   * @param {String} [options.filter] - Filtro simple ('unread', 'promotions', 'attachments', 'old').
   * @param {String} [options.dateBefore] - Fecha límite para correos viejos, formato YYYY/MM/DD.
   * @param {Number} [options.maxResults] - Máximo de resultados.
   * @param {Array} [options.combine] - Combinación de filtros.
   * @returns {Promise<Array>} Lista de metadatos de mensajes.
   */
  async listMessages({ filter, dateBefore, maxResults, combine }) {
    const query = this._buildQuery({ filter, dateBefore, combine });

    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: maxResults || 20,
    });

    const messages = res.data.messages || [];
    return this._fetchMetadataForMessages(messages);
  }

  _buildQuery({ filter, dateBefore, combine }) {
    let queries = [];
    const combined = combine || [];
    if (filter) combined.push(filter);

    if (combined.includes('unread')) queries.push('is:unread');
    if (combined.includes('promotions')) queries.push('category:promotions');
    if (combined.includes('attachments')) queries.push('has:attachment larger:2M');
    if (combined.includes('old'))
      queries.push(`before:${dateBefore ? dateBefore.replace(/-/g, '/') : '2023/01/01'}`);

    return queries.join(' ') || '';
  }

  async _fetchMetadataForMessages(messages) {
    // Trae solo metadatos de cada mensaje (id, subject, from, date, snippet, adjunto, size)
    const results = [];
    for (const msg of messages) {
      const msgData = await this.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });
      const payload = msgData.data.payload || {};
      const headers = (payload.headers || []).reduce((acc, h) => {
        acc[h.name.toLowerCase()] = h.value;
        return acc;
      }, {});
      results.push({
        id: msg.id,
        subject: headers.subject || '',
        from: headers.from || '',
        date: headers.date || '',
        snippet: msgData.data.snippet,
        hasAttachment: (payload.parts || []).some(part => part.filename && part.filename !== ''),
        size: msgData.data.sizeEstimate,
      });
    }
    return results;
  }
}

module.exports = GmailService;
