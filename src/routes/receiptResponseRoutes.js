import {
  getReceiptResponse,
  upsertReceiptResponse,
} from '../controllers/receiptResponseController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const RESPONSE_VALUE_SCHEMA = {
  anyOf: [
    { type: 'string', enum: ['paid', 'ignore'] },
    { type: 'null' },
  ],
};

const BODY_SCHEMA = {
  type: 'object',
  required: ['targetId', 'response'],
  additionalProperties: false,
  properties: {
    targetId: { type: 'string', minLength: 1 },
    response: { type: 'string', enum: ['paid', 'ignore'] },
  },
};

const PARAMS_SCHEMA = {
  type: 'object',
  required: ['targetId'],
  additionalProperties: false,
  properties: {
    targetId: { type: 'string', minLength: 1 },
  },
};

const RECEIPT_RESPONSE_SCHEMA = {
  $id: 'ReceiptResponse',
  type: 'object',
  required: ['targetId', 'response', 'updatedAt'],
  additionalProperties: false,
  properties: {
    targetId: { type: 'string' },
    response: RESPONSE_VALUE_SCHEMA,
    updatedAt: {
      anyOf: [
        { type: 'string', format: 'date-time' },
        { type: 'null' },
      ],
    },
  },
};

export default async function receiptResponseRoutes(fastify) {
  fastify.addSchema(RECEIPT_RESPONSE_SCHEMA);

  fastify.post(
    '/receipt-responses',
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ['official-v1', 'Receipt Responses'],
        summary: 'Register a manual receipt response',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        body: BODY_SCHEMA,
        response: {
          200: { $ref: 'ReceiptResponse#' },
          400: { description: 'Invalid payload' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    upsertReceiptResponse,
  );

  fastify.get(
    '/receipt-responses/:targetId',
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ['official-v1', 'Receipt Responses'],
        summary: 'Read the current manual receipt response state',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        params: PARAMS_SCHEMA,
        response: {
          200: { $ref: 'ReceiptResponse#' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    getReceiptResponse,
  );
}
