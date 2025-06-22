// src/routes/suggestionRoutes.js

import { getSuggestedEmails } from '../controllers/suggestionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

// Registra el esquema global para sugerencias (si no lo tienes ya)
const emailSuggestionSchema = {
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
      items: { type: 'string' }
    }
  }
};

export default async function (fastify, opts) {
  // Solo registra el esquema una vez
  if (!fastify.getSchema('EmailSuggestion')) {
    fastify.addSchema(emailSuggestionSchema);
  }

  fastify.get('/suggestions', {
    preHandler: [authMiddleware], // Si tu endpoint requiere auth
    schema: {
      description: 'Obtiene sugerencias automáticas de acción para correos (no ejecuta acciones, solo recomienda)',
      tags: ['Sugerencias'],
      response: {
        200: {
          description: 'Lista de sugerencias para limpieza',
          type: 'object',
          properties: {
            emails: {
              type: 'array',
              items: { $ref: 'EmailSuggestion#' }
            }
          },
          example: {
            emails: [
              {
                id: "abc123",
                from: "notificaciones@ejemplo.com",
                subject: "Promoción especial",
                date: "2024-07-01T12:00:00Z",
                isRead: false,
                category: "promotions",
                attachmentSizeMb: 2.5,
                suggestions: ["suggested-archive"]
              }
            ]
          }
        }
      },
      security: [{ bearerAuth: [] }] // Si quieres requerir JWT
    },
    handler: getSuggestedEmails
  });
}
