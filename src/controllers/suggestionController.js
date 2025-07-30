// src/controllers/suggestionController.js

import { GmailService } from '../services/gmailService.js';
import { google } from 'googleapis';
import { suggestActions } from '../services/emailSuggester.js';

/**
 * Controlador para Fastify: sugiere acciones automáticas para correos (sin ejecutarlas).
 */
export async function getSuggestedEmails(request, reply) {
    try {
        // 1. Autenticación: Prepara el cliente Gmail usando el token del usuario autenticado
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: request.user.googleAccessToken });

        // 2. Instancia de Gmail API
        const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
        const gmailService = new GmailService(gmailClient);

        // 3. Llama al método del servicio para obtener correos (puedes ajustar filtros aquí)
        const emails = await gmailService.listMessages({
            maxResults: 20
            // Puedes agregar más filtros: filter, dateBefore, combine, etc.
        });

        // 4. Espera el resultado de las sugerencias
        const { emails: enrichedEmails } = await suggestActions(emails);

        // 5. Responde con la estructura que espera Swagger
        reply
            .type('application/json')
            .send(JSON.stringify({ emails: enrichedEmails }));

    } catch (err) {
        request.log.error(err, 'Error obteniendo sugerencias');
        reply.status(500).send({ error: 'Error procesando sugerencias de correo' });
    }
}
