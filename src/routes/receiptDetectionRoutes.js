import { extractReceipt } from '../controllers/receiptDetectionController.js';

const BODY_SCHEMA = {
  type: 'object',
  required: ['subject', 'body'],
  properties: {
    subject: { type: 'string' },
    body: { type: 'string' },
    html: { type: ['string', 'null'] }
  },
  additionalProperties: false
};

export default async function receiptDetectionRoutes(fastify) {
  fastify.post('/receipt-detection/extract', { schema: { body: BODY_SCHEMA } }, extractReceipt);
}
