// notificationsController.js
import { notificationsService } from '../services/notificationsService.js';

// GET /notifications/summary
export async function getSummary(request, reply) {
    // TODO: Extraer usuario autenticado (request.user o token)
    // TODO: Lógica para obtener sugerencias no confirmadas agrupadas por fecha
    const summary = await notificationsService.getSummary(/* userId */);
    return reply.send(summary);
}

// POST /notifications/confirm
export async function confirmActions(request, reply) {
    // TODO: Validar payload (ids, acción)
    // TODO: Ejecutar acción (aceptar/rechazar), actualizar Gmail y registrar historial
    // Ejemplo de payload: { ids: [string], action: 'accept' | 'reject' }
    const { ids, action } = request.body;
    const userId = request.user?.id || 'demo-user';

    const service = notificationsService(request.server.models); // ✅ esto es clave

    const result = await service.confirmActions({ ids, action, userId });
    return reply.send(result);
}
