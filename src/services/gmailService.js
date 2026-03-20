// src/services/gmailService.js

export class GmailService {
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

    async listMessagesByQuery({ query, maxResults, pageToken }) {
        const res = await this.gmail.users.messages.list({
            userId: 'me',
            q: query || '',
            pageToken,
            maxResults: maxResults || 20,
        });

        const messages = res.data.messages || [];
        const emails = await this._fetchMetadataForMessages(messages);

        return {
            emails,
            nextPageToken: res.data.nextPageToken || null,
            total: res.data.resultSizeEstimate || 0,
        };
    }

    async getMessageContent({ messageId }) {
        try {
            const res = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });

            return normalizeMessageContent(res.data);
        } catch (err) {
            if (err?.code === 404 || err?.status === 404) {
                return null;
            }

            throw err;
        }
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

            function detectCategoryFromLabels(labels) {
                if (labels.includes('CATEGORY_PROMOTIONS')) return 'promotions';
                if (labels.includes('CATEGORY_SOCIAL')) return 'social';
                if (labels.includes('CATEGORY_UPDATES')) return 'updates';
                if (labels.includes('CATEGORY_FORUMS')) return 'forums';
                if (labels.includes('INBOX')) return 'primary';
                return undefined;
            }
            results.push({
                id: msg.id,
                subject: headers.subject || '',
                from: headers.from || '',
                date: headers.date || '',
                labels: msgData.data.labelIds || [],
                isRead: !(msgData.data.labelIds?.includes('UNREAD')),
                category: detectCategoryFromLabels(msgData.data.labelIds || []) || 'unknown',
                attachmentSizeMb: msgData.data.sizeEstimate
                    ? msgData.data.sizeEstimate / (1024 * 1024)
                    : 0,
                snippet: msgData.data.snippet,
                hasAttachment: (payload.parts || []).some(part => part.filename && part.filename !== ''),
                size: msgData.data.sizeEstimate,
            });
        }
        return results;
    }


}

const decodeBase64Url = (value = '') => Buffer.from(String(value).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

const collectParts = (payload, mimeType) => {
    if (!payload) return [];

    const matches = [];
    if (payload.mimeType === mimeType && payload.body?.data) {
        matches.push(decodeBase64Url(payload.body.data));
    }

    for (const part of payload.parts || []) {
        matches.push(...collectParts(part, mimeType));
    }

    return matches;
};

const normalizeWhitespace = (value = '') => String(value)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const normalizeMessageContent = (message = {}) => {
    const payload = message.payload || {};
    const headers = (payload.headers || []).reduce((acc, header) => {
        acc[String(header.name || '').toLowerCase()] = header.value || '';
        return acc;
    }, {});

    const plainTextParts = collectParts(payload, 'text/plain');
    const htmlParts = collectParts(payload, 'text/html');
    const fallbackBody = payload.body?.data ? decodeBase64Url(payload.body.data) : '';
    const normalizedBody = normalizeWhitespace(plainTextParts.join('\n\n') || fallbackBody);
    const normalizedHtml = normalizeWhitespace(htmlParts.join('\n\n'));

    if (!normalizedBody) {
        const error = new Error('email_content_normalization_failed');
        error.code = 'EMAIL_CONTENT_NORMALIZATION_FAILED';
        throw error;
    }

    return {
        id: message.id || '',
        subject: headers.subject || '',
        from: headers.from || '',
        body: normalizedBody,
        html: normalizedHtml || null,
    };
};
