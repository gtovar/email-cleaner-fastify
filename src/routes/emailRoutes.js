// src/routes/emailRoutes.js
import { getEmailContent, listEmails } from '../controllers/emailController.js';
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

  fastify.addSchema({
    $id: 'EmailContent',
    type: 'object',
    required: ['id', 'subject', 'from', 'body', 'html'],
    properties: {
      id: { type: 'string' },
      subject: { type: 'string' },
      from: { type: 'string' },
      body: { type: 'string', minLength: 1 },
      html: { type: ['string', 'null'] }
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

  fastify.get('/emails/:id/content', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Fetch normalized full content for one email',
      tags: ['official-v1', 'Emails'],
      summary: 'Get email content by id',
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Normalized email content',
          $ref: 'EmailContent#'
        },
        401: { description: 'No autorizado' },
        404: { description: 'Email content not found' },
        500: { description: 'Error interno' }
      }
    }
  }, getEmailContent);
}
