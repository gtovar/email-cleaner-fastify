import { notifyReceipt } from '../services/notifications/receiptNotificationService.js';

export async function sendReceiptNotification(request, reply) {
  const payload = request.body;
  if (!payload || typeof payload !== 'object') {
    return reply.code(400).send({ message: 'Invalid payload' });
  }

  const result = await notifyReceipt(payload);
  return reply.send(result);
}
