import { runInboxActions } from '../controllers/inboxActionsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

export default async function inboxRoutes(fastify) {
  fastify.addSchema({
    $id: 'InboxActionsRequest',
    type: 'object',
    required: ['emailIds', 'action'],
    additionalProperties: false,
    properties: {
      emailIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: { type: 'string', minLength: 1 },
      },
      action: {
        type: 'string',
        enum: ['archive', 'delete', 'mark_unread'],
      },
    },
  });

  fastify.addSchema({
    $id: 'InboxActionsResponse',
    type: 'object',
    required: ['success', 'execution', 'action', 'source', 'summary', 'results'],
    additionalProperties: false,
    properties: {
      success: { type: 'boolean' },
      execution: {
        type: 'string',
        enum: ['full', 'partial', 'none'],
      },
      action: {
        type: 'string',
        enum: ['archive', 'delete', 'mark_unread'],
      },
      source: { type: 'string', const: 'inbox' },
      summary: {
        type: 'object',
        required: ['total', 'processed', 'failed'],
        additionalProperties: false,
        properties: {
          total: { type: 'integer', minimum: 0 },
          processed: { type: 'integer', minimum: 0 },
          failed: { type: 'integer', minimum: 0 },
        },
      },
      results: {
        type: 'array',
        items: {
          type: 'object',
          required: ['emailId', 'status'],
          additionalProperties: false,
          properties: {
            emailId: { type: 'string' },
            status: { type: 'string', enum: ['ok', 'error'] },
            reason: { type: 'string' },
          },
        },
      },
    },
  });

  fastify.post('/actions', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['official-v1', 'Inbox'],
      summary: 'Execute direct Inbox actions',
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      body: { $ref: 'InboxActionsRequest#' },
      response: {
        200: { $ref: 'InboxActionsResponse#' },
        400: { description: 'Invalid payload' },
        401: { description: 'Unauthorized' },
      },
    },
  }, runInboxActions);
}
