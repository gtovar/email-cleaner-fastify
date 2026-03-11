import { describe, expect, it } from '@jest/globals';
import { fixtureInboxSource, fixtureInboxUserEmail } from '../src/services/inboxSources/fixtureInboxSource.js';

describe('fixtureInboxSource', () => {
  it('returns the fixed HU19 dataset for the fixture user', async () => {
    const result = await fixtureInboxSource.listEmails({
      email: fixtureInboxUserEmail,
      maxResults: 20,
    });

    expect(result.total).toBe(3);
    expect(result.nextPageToken).toBeNull();
    expect(result.emails).toEqual([
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
    ]);
  });

  it('returns no emails for non-fixture users', async () => {
    const result = await fixtureInboxSource.listEmails({
      email: 'user@example.com',
      maxResults: 20,
    });

    expect(result).toEqual({
      emails: [],
      nextPageToken: null,
      total: 0,
    });
  });
});
