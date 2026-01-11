import { describe, expect, beforeEach, it, jest } from '@jest/globals';
import { GmailService } from '../src/services/gmailService.js';

describe('GmailService', () => {
  let listMock;
  let getMock;
  let service;

  beforeEach(() => {
    listMock = jest.fn();
    getMock = jest.fn();

    const gmailClient = {
      users: {
        messages: {
          list: listMock,
          get: getMock
        }
      }
    };

    service = new GmailService(gmailClient);
  });

  it('builds the expected query and returns enriched metadata', async () => {
    listMock.mockResolvedValue({
      data: {
        messages: [{ id: '123' }, { id: '456' }]
      }
    });

    getMock
      .mockResolvedValueOnce({
        data: {
          payload: {
            headers: [
              { name: 'Subject', value: 'Hello' },
              { name: 'From', value: 'team@example.com' },
              { name: 'Date', value: '2024-01-01' }
            ],
            parts: [
              { filename: '', body: {} },
              { filename: 'invoice.pdf', body: { attachmentId: 'A1' } }
            ]
          },
          labelIds: ['INBOX', 'UNREAD'],
          snippet: 'Hi there',
          sizeEstimate: 2048
        }
      })
      .mockResolvedValueOnce({
        data: {
          payload: {
            headers: [],
            parts: []
          },
          labelIds: ['CATEGORY_PROMOTIONS'],
          snippet: 'Promo',
          sizeEstimate: 1024
        }
      });

    const result = await service.listMessages({
      filter: 'unread',
      combine: ['promotions', 'attachments', 'old'],
      dateBefore: '2024-03-01',
      maxResults: 5
    });

    expect(listMock).toHaveBeenCalledWith({
      userId: 'me',
      q: 'is:unread category:promotions has:attachment larger:2M before:2024/03/01',
      maxResults: 5
    });

    expect(getMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      {
        id: '123',
        subject: 'Hello',
        from: 'team@example.com',
        date: '2024-01-01',
        labels: ['INBOX', 'UNREAD'],
        isRead: false,
        category: 'primary',
        attachmentSizeMb: 0.001953125,
        snippet: 'Hi there',
        hasAttachment: true,
        size: 2048
      },
      {
        id: '456',
        subject: '',
        from: '',
        date: '',
        labels: ['CATEGORY_PROMOTIONS'],
        isRead: true,
        category: 'promotions',
        attachmentSizeMb: 0.0009765625,
        snippet: 'Promo',
        hasAttachment: false,
        size: 1024
      }
    ]);
  });
});
