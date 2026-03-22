const FIXTURE_USER_EMAIL = 'e2e-user@example.com';

const FIXTURE_EMAILS = [
  {
    id: 'email-hu19-archive',
    subject: '[E2E-HU19] Archive Target',
    from: 'E2E Sender <archive@example.com>',
    date: '2026-03-10T08:00:00.000Z',
    labels: ['INBOX', 'UNREAD'],
    isRead: false,
    category: 'primary',
    attachmentSizeMb: 0,
    snippet: 'Archive me from the Inbox row-level flow.',
    hasAttachment: false,
    size: 1024,
  },
  {
    id: 'email-hu19-delete',
    subject: '[E2E-HU19] Delete Target',
    from: 'E2E Sender <delete@example.com>',
    date: '2026-03-10T09:00:00.000Z',
    labels: ['INBOX', 'UNREAD'],
    isRead: false,
    category: 'promotions',
    attachmentSizeMb: 0,
    snippet: 'Delete me from the Inbox row-level flow.',
    hasAttachment: false,
    size: 2048,
  },
  {
    id: 'email-hu19-read',
    subject: '[E2E-HU19] Mark Unread Target',
    from: 'E2E Sender <read@example.com>',
    date: '2026-03-10T10:00:00.000Z',
    labels: ['INBOX'],
    isRead: true,
    category: 'updates',
    attachmentSizeMb: 0,
    snippet: 'Mark me as unread from the Inbox row-level flow.',
    hasAttachment: false,
    size: 3072,
  },
  {
    id: 'email-hu06-success',
    subject: '[E2E-HU06] Receipt Success Target',
    from: 'Utility Billing <receipt-success@example.com>',
    date: '2026-03-10T11:00:00.000Z',
    labels: ['INBOX', 'UNREAD'],
    isRead: false,
    category: 'updates',
    attachmentSizeMb: 0,
    snippet: 'Receipt review happy-path target for manual WhatsApp send validation.',
    hasAttachment: false,
    size: 4096,
  },
  {
    id: 'email-hu06-provider-error',
    subject: '[E2E-HU06] Receipt Provider Error Target',
    from: 'Utility Billing <receipt-provider-error@example.com>',
    date: '2026-03-10T12:00:00.000Z',
    labels: ['INBOX', 'UNREAD'],
    isRead: false,
    category: 'updates',
    attachmentSizeMb: 0,
    snippet: 'Receipt review error-path target for visible retry validation.',
    hasAttachment: false,
    size: 5120,
  },
];

const FIXTURE_EMAIL_CONTENT = {
  'email-hu19-archive': {
    id: 'email-hu19-archive',
    subject: '[E2E-HU19] Archive Target',
    from: 'E2E Sender <archive@example.com>',
    body: 'Archive me from the Inbox row-level flow. Recibo de luz CFE. Total a pagar: $350.50. Fecha limite de pago: 25/03/2026.',
    html: null,
  },
  'email-hu19-delete': {
    id: 'email-hu19-delete',
    subject: '[E2E-HU19] Delete Target',
    from: 'E2E Sender <delete@example.com>',
    body: 'Delete me from the Inbox row-level flow. Recibo de luz CFE. Total a pagar: $900.00. Fecha limite de pago: 28/03/2026.',
    html: null,
  },
  'email-hu19-read': {
    id: 'email-hu19-read',
    subject: '[E2E-HU19] Mark Unread Target',
    from: 'E2E Sender <read@example.com>',
    body: 'Mark me as unread from the Inbox row-level flow. Recibo de luz CFE. Total a pagar: $120.75. Fecha limite de pago: 30/03/2026.',
    html: null,
  },
  'email-hu06-success': {
    id: 'email-hu06-success',
    subject: '[E2E-HU06] Receipt Success Target',
    from: 'Utility Billing <receipt-success@example.com>',
    body: 'Recibo de luz CFE. Total a pagar: $350.50. Fecha limite de pago: 25/03/2026.',
    html: null,
  },
  'email-hu06-provider-error': {
    id: 'email-hu06-provider-error',
    subject: '[E2E-HU06] Receipt Provider Error Target',
    from: 'Utility Billing <receipt-provider-error@example.com>',
    body: 'Recibo de luz CFE. Total a pagar: $900.00. Fecha limite de pago: 28/03/2026.',
    html: null,
  },
};

const decodePageToken = (pageToken) => {
  if (!pageToken) return 0;
  const [, rawOffset] = String(pageToken).split(':');
  const offset = Number(rawOffset);
  return Number.isFinite(offset) && offset >= 0 ? offset : 0;
};

const encodePageToken = (offset) => `fixture:${offset}`;

export const fixtureInboxSource = {
  async listEmails({ email, unread, olderThan, category, minAttachmentSize, pageToken, maxResults }) {
    if (email !== FIXTURE_USER_EMAIL) {
      return {
        emails: [],
        nextPageToken: null,
        total: 0,
      };
    }

    const filtered = FIXTURE_EMAILS.filter((item) => {
      if (unread && item.isRead) return false;
      if (category && item.category !== category) return false;
      if (minAttachmentSize && item.attachmentSizeMb < Number(minAttachmentSize)) return false;
      // The HU19 browser flow does not depend on temporal filters, so fixture mode leaves olderThan inert.
      void olderThan;
      return true;
    });

    const offset = decodePageToken(pageToken);
    const limit = Number.isFinite(Number(maxResults)) ? Number(maxResults) : 20;
    const emails = filtered.slice(offset, offset + limit).map((item) => ({ ...item }));
    const nextOffset = offset + limit;

    return {
      emails,
      nextPageToken: nextOffset < filtered.length ? encodePageToken(nextOffset) : null,
      total: filtered.length,
    };
  },
  async getEmailContent({ email, emailId }) {
    if (email !== FIXTURE_USER_EMAIL) {
      return null;
    }

    const content = FIXTURE_EMAIL_CONTENT[emailId];
    return content ? { ...content } : null;
  },
};

export const fixtureInboxUserEmail = FIXTURE_USER_EMAIL;
