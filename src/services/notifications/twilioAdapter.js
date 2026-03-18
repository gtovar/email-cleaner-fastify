export async function sendWhatsAppMessage({ to, body }) {
  if (typeof to !== 'string' || !to.trim()) {
    throw new Error('invalid_whatsapp_recipient');
  }
  if (typeof body !== 'string' || !body.trim()) {
    throw new Error('invalid_whatsapp_body');
  }

  return {
    provider: 'twilio',
    status: 'sent',
    providerMessageId: 'twilio-sandbox-message-id',
  };
}
