// src/routes/notificationsRoutes.js
import { getSummary, confirmActions } from '../controllers/notificationsController.js';
import { getHistory } from '../controllers/actionHistoryController.js';
import { listEvents } from '../controllers/notificationEventsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

export default async function (fastify, opts) {
  // Schema global para sugerencia de correo (si no está registrado ya)
  fastify.addSchema({
    $id: 'EmailSuggestion',
    type: 'object',
    properties: {
      id: { type: 'string' },
      from: { type: 'string' },
      subject: { type: 'string' },
      date: { type: 'string' },
      isRead: { type: 'boolean' },
      category: { type: 'string' },
      attachmentSizeMb: { type: 'number' },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            clasificacion: { type: 'string' },
            confidence_score: { type: 'number' }
          },
          required: ['action', 'clasificacion', 'confidence_score']
        }
      }
    }
  });

  fastify.addSchema({
    $id: 'NotificationsSummary',
    type: 'object',
    properties: {
      period: { type: 'string' },
      windowStart: { type: 'string', nullable: true },
      windowEnd: { type: 'string', nullable: true },
      totalEvents: { type: 'integer' },
      totalSuggestions: { type: 'integer' },
      totalConfirmed: { type: 'integer' },
      suggestedActions: {
        type: 'object',
        additionalProperties: { type: 'integer' }
      },
      confirmedActions: {
        type: 'object',
        additionalProperties: { type: 'integer' }
      },
      clasificaciones: {
        type: 'object',
        additionalProperties: { type: 'integer' }
      }
    }
  });

  // ConfirmActionsRequest schema
  fastify.addSchema({
    $id: 'ConfirmActionsRequest',
    type: 'object',
    required: ['emailIds', 'action'],
    additionalProperties: false,
    properties: {
      emailIds: { type: "array", minItems: 1, uniqueItems: true, items: { type: "string", minLength: 1 } },
      action: { type: 'string', enum: ['accept', 'reject'] }
    }
  });

  // ConfirmActionsResponse schema
  fastify.addSchema({
    $id: 'ConfirmActionsResponse',
    type: 'object',
    required: ['success','processed','emailIds', 'action'],
    properties: {
      success: { type: 'boolean' },
      processed: { type: "integer", minimum: 0 },
      emailIds: { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } },
      action: { type: 'string', enum: ["accept", "reject"] }
    }
  });

  // Historial de acciones (item y listado)
  fastify.addSchema({
    $id: 'ActionHistoryItem',
    type: 'object',
    properties: {
      userId: { type: 'string' },
      emailId: { type: 'string' },
      action: { type: 'string', enum: ['accept', 'reject', 'delete', 'archive', 'move'] },
      timestamp: { type: 'string', format: 'date-time' },
      details: { type: 'object' }
    }
  });
  fastify.addSchema({
    $id: 'ActionHistoryList',
    type: 'object',
    properties: {
      total: { type: 'integer' },
      page: { type: 'integer' },
      perPage: { type: 'integer' },
      data: { type: 'array', items: { $ref: 'ActionHistoryItem#' } }
    }
  });

  // Notification event item (timestamps enabled)
  fastify.addSchema({
    $id: 'NotificationEvent',
    type: 'object',
    properties: {
      type: { type: 'string' },
      userId: { type: 'string' },
      summary: { type: 'object' },
      createdAt: { type: 'string', format: 'date-time', description: 'timestamps: true ensures createdAt exists' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  });

  fastify.addSchema({
    $id: 'NotificationEventList',
    type: 'object',
    properties: {
      total: { type: 'integer' },
      page: { type: 'integer' },
      perPage: { type: 'integer' },
      data: { type: 'array', items: { $ref: 'NotificationEvent#' } }
    }
  });

  // GET /summary
  fastify.get('/summary', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['official-v1','Notificaciones'],
      summary: 'Obtener resumen de sugerencias a limpiar',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['daily', 'weekly'], description: 'Periodo de resumen' }
        }
      },
      response: {
        200: {
          $ref: 'NotificationsSummary#'
        },
        401: { description: 'No autorizado' }
      }
    }
  }, getSummary);

  // POST /confirm
  fastify.post('/confirm', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['official-v1','Notificaciones'],
      summary: 'Confirmar acciones sugeridas',
      security: [{ bearerAuth: [] }],
      body: { $ref: 'ConfirmActionsRequest#' },
      response: {
        200: { $ref: 'ConfirmActionsResponse#' },
        400: { description: 'Datos inválidos' },
        401: { description: 'No autorizado' }
      }
    }
  }, confirmActions);

  // GET /history
  fastify.get('/history', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['official-v1','Notificaciones'],
      summary: 'Consultar historial de acciones',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          perPage: { type: 'integer', default: 20 }
        }
      },
      response: {
        200: { $ref: 'ActionHistoryList#' },
        401: { description: 'No autorizado' }
      }
    }
  }, getHistory);

  // GET /events
  fastify.get('/events', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['official-v1','Notificaciones'],
      summary: 'Listar eventos de notificaciones (paginado)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          perPage: { type: 'integer', default: 20 },
          type: { type: 'string', description: 'Filtra por tipo de evento' },
          userId: { type: 'string', description: 'Filtra por usuario (especificación funcional)' }
        }
      },
      response: {
        200: { $ref: 'NotificationEventList#' },
        401: { description: 'No autorizado' }
      }
    }
  }, listEvents);
}
