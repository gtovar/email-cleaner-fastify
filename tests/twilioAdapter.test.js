import { sendWhatsAppMessage } from '../src/services/notifications/twilioAdapter.js';

describe('twilioAdapter', () => {
  it('rejects invalid recipient', async () => {
    await expect(sendWhatsAppMessage({ to: '', body: 'hola' })).rejects.toThrow('invalid_whatsapp_recipient');
  });

  it('rejects invalid body', async () => {
    await expect(sendWhatsAppMessage({ to: '+5218', body: '' })).rejects.toThrow('invalid_whatsapp_body');
  });

  it('returns a stable result', async () => {
    const result = await sendWhatsAppMessage({ to: '+5218', body: 'hola' });
    expect(result).toEqual({
      provider: 'twilio',
      status: 'sent',
      providerMessageId: 'twilio-sandbox-message-id',
    });
  });
});
