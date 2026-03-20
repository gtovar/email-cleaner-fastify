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

  it('returns normalized full message content', async () => {
    getMock.mockResolvedValue({
      data: {
        id: 'abc123',
        payload: {
          headers: [
            { name: 'Subject', value: 'Factura CFE' },
            { name: 'From', value: 'notificaciones@cfe.mx' }
          ],
          parts: [
            {
              mimeType: 'text/plain',
              body: {
                data: Buffer.from(' Total a pagar: $350.50 \n\n Fecha limite de pago: 2026-03-25 ').toString('base64url')
              }
            },
            {
              mimeType: 'text/html',
              body: {
                data: Buffer.from('<p>Total a pagar: <strong>$350.50</strong></p>').toString('base64url')
              }
            }
          ]
        }
      }
    });

    const result = await service.getMessageContent({ messageId: 'abc123' });

    expect(getMock).toHaveBeenCalledWith({
      userId: 'me',
      id: 'abc123',
      format: 'full'
    });
    expect(result).toEqual({
      id: 'abc123',
      subject: 'Factura CFE',
      from: 'notificaciones@cfe.mx',
      body: 'Total a pagar: $350.50\n\nFecha limite de pago: 2026-03-25',
      html: '<p>Total a pagar: <strong>$350.50</strong></p>'
    });
  });

  it('returns null when Gmail reports 404 for the message id', async () => {
    const notFoundError = new Error('not found');
    notFoundError.code = 404;
    getMock.mockRejectedValue(notFoundError);

    await expect(service.getMessageContent({ messageId: 'missing-id' })).resolves.toBeNull();
  });

  it('throws EMAIL_CONTENT_NORMALIZATION_FAILED when the normalized body is empty', async () => {
    getMock.mockResolvedValue({
      data: {
        id: 'abc123',
        payload: {
          headers: [],
          parts: [
            {
              mimeType: 'text/html',
              body: {
                data: Buffer.from('<p>Only html</p>').toString('base64url')
              }
            }
          ]
        }
      }
    });

    await expect(service.getMessageContent({ messageId: 'abc123' })).rejects.toMatchObject({
      code: 'EMAIL_CONTENT_NORMALIZATION_FAILED',
      message: 'email_content_normalization_failed'
    });
  });
});
