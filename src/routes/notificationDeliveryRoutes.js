import { sendReceiptNotification } from '../controllers/notificationDeliveryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const BODY_SCHEMA = {
  type: 'object',
  required: ['emailId', 'sender', 'subject', 'amount', 'due_date', 'phone'],
  properties: {
    emailId: { type: 'string' },
    sender: { type: 'string' },
    subject: { type: 'string' },
    amount: { type: ['string', 'null'] },
    due_date: { type: ['string', 'null'] },
    phone: { type: 'string' },
  },
  additionalProperties: false,
};

export default async function notificationDeliveryRoutes(fastify) {
  fastify.post(
    '/notifications/receipt-whatsapp',
    {
      preHandler: [authMiddleware],
      schema: { body: BODY_SCHEMA }
    },
    sendReceiptNotification
  );
}
