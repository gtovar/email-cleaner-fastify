import { detectReceiptFields } from '../services/receiptDetection/receiptDetectionService.js';

export async function extractReceipt(request, reply) {
  const { subject, body, html = null } = request.body ?? {};

  if (typeof subject !== 'string' || typeof body !== 'string' || (html !== null && typeof html !== 'string')) {
    return reply.code(400).send({ message: 'Invalid payload for receipt extraction' });
  }

  const result = detectReceiptFields({ subject, body, html });
  return reply.send(result);
}
