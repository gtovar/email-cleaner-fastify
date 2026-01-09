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
            items: {
                type: 'object',
                properties: {
                    action: { type: 'string' },
                    category: { type: 'string' },
                    confidence_score: { type: 'number' }
                },
                required: ['action', 'category', 'confidence_score']
            }
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
            tags: ['official-v1','Sugerencias'],
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
                                suggestions: [
                                    {
                                        action: "archive",
                                        category: "promotions",
                                        confidence_score: 0.91
                                    }
                                ]
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
