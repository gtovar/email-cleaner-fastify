import { sendWhatsAppMessage } from './twilioAdapter.js';
import { logDelivery } from './notificationDeliveryLogService.js';

export async function notifyReceipt({
  emailId,
  sender,
  subject,
  amount,
  due_date,
  phone,
}) {
  if (!amount || !due_date) {
    logDelivery({
      emailId,
      channel: 'whatsapp',
      status: 'skipped',
      reason: 'missing_extracted_fields',
      sender,
      amount,
      due_date,
    });

    return {
      sent: false,
      reason: 'missing_extracted_fields',
    };
  }

  if (typeof phone !== 'string' || !phone.trim()) {
    logDelivery({
      emailId,
      channel: 'whatsapp',
      status: 'skipped',
      reason: 'missing_recipient',
      sender,
      amount,
      due_date,
    });

    return {
      sent: false,
      reason: 'missing_recipient',
    };
  }

  const safeSender = typeof sender === 'string' && sender.trim() ? sender.trim() : 'Remitente desconocido';
  const safeSubject = typeof subject === 'string' && subject.trim() ? subject.trim() : 'recibo detectado';
  const body = `Recordatorio: ${safeSender} — ${safeSubject}. Monto: ${amount}. Vence el ${due_date}.`;

  try {
    const providerResult = await sendWhatsAppMessage({ to: phone, body });

    logDelivery({
      emailId,
      channel: 'whatsapp',
      status: 'sent',
      providerMessageId: providerResult.providerMessageId,
      sender: safeSender,
      amount,
      due_date,
    });

    return {
      sent: true,
      provider: providerResult.provider,
      status: providerResult.status,
      providerMessageId: providerResult.providerMessageId,
    };
  } catch (error) {
    logDelivery({
      emailId,
      channel: 'whatsapp',
      status: 'failed',
      reason: 'provider_error',
      sender: safeSender,
      amount,
      due_date,
    });

    return {
      sent: false,
      reason: 'provider_error',
    };
  }
}
