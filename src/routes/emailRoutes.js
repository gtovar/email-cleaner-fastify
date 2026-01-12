// src/routes/emailRoutes.js
import { listEmails } from '../controllers/emailController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

export default async function (fastify, opts) {
  // Registra el esquema Email global una vez
  fastify.addSchema({
    $id: 'Email',
    type: 'object',
    properties: {
      id: { type: 'string' },
      subject: { type: 'string' },
      from: { type: 'string' },
      date: { type: 'string' },
      labels: { type: 'array', items: { type: 'string' } },
      isRead: { type: 'boolean' },
      category: { type: 'string' },
      attachmentSizeMb: { type: 'number' },
      snippet: { type: 'string' },
      hasAttachment: { type: 'boolean' },
      size: { type: 'integer' }
    }
  });

  fastify.get('/emails', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Lista correos con filtros personalizados',
      tags: ['official-v1','Emails'],
      summary: 'Listar correos de Gmail',
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          unread: { type: 'boolean', description: 'Solo correos no leídos' },
          olderThan: { type: 'integer', description: 'Más viejos que N días', minimum: 1},
          category: {
            type: 'string',
            enum: ['promotions', 'social', 'updates', 'forums', 'primary'],
            description: 'Categoría de Gmail'
          },
          minAttachmentSize: { type: 'integer', description: 'Adjuntos > N MB', minimum: 1},
          pageToken: { type: 'string', description: 'Token para paginación' }
        }
      },
      response: {
        200: {
          description: 'Lista de correos',
          type: 'object',
          properties: {
            emails: { type: 'array', items: { $ref: 'Email#' } },
            nextPageToken: { type: 'string', nullable: true },
            total: { type: 'integer' }
          }
        },
        401: { description: 'No autorizado' },
        500: { description: 'Error interno' }
      }
    }
  }, listEmails);
}
