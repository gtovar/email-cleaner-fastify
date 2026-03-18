import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/services/notifications/twilioAdapter.js', () => ({
  sendWhatsAppMessage: jest.fn(),
}));

jest.unstable_mockModule('../src/services/notifications/notificationDeliveryLogService.js', () => ({
  logDelivery: jest.fn(),
}));

const { notifyReceipt } = await import('../src/services/notifications/receiptNotificationService.js');
const { sendWhatsAppMessage } = await import('../src/services/notifications/twilioAdapter.js');
const { logDelivery } = await import('../src/services/notifications/notificationDeliveryLogService.js');

describe('notifyReceipt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips when amount missing', async () => {
    const result = await notifyReceipt({ emailId: '1', sender: 'CFE', subject: 'R', amount: null, due_date: '2026-03-27', phone: '+52' });
    expect(result).toEqual({ sent: false, reason: 'missing_extracted_fields' });
    expect(logDelivery).toHaveBeenCalledWith(expect.objectContaining({ status: 'skipped' }));
  });

  it('skips when phone missing', async () => {
    const result = await notifyReceipt({ emailId: '2', sender: 'CFE', subject: 'R', amount: '100', due_date: '2026-03-27', phone: '' });
    expect(result).toEqual({ sent: false, reason: 'missing_recipient' });
    expect(logDelivery).toHaveBeenCalledWith(expect.objectContaining({ reason: 'missing_recipient' }));
  });

  it('returns sent true when provider succeeds', async () => {
    sendWhatsAppMessage.mockResolvedValue({ provider: 'twilio', status: 'sent', providerMessageId: 'ID' });
    const result = await notifyReceipt({ emailId: '3', sender: 'CFE', subject: 'R', amount: '100', due_date: '2026-03-27', phone: '+52' });
    expect(result.sent).toBe(true);
    expect(result.provider).toBe('twilio');
    expect(logDelivery).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent' }));
  });

  it('handles provider error', async () => {
    sendWhatsAppMessage.mockRejectedValue(new Error('boom'));
    const result = await notifyReceipt({ emailId: '4', sender: 'CFE', subject: 'R', amount: '100', due_date: '2026-03-27', phone: '+52' });
    expect(result).toEqual({ sent: false, reason: 'provider_error' });
    expect(logDelivery).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed', reason: 'provider_error' }));
  });
});
