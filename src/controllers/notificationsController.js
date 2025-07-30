// notificationsController.js
import { notificationsService } from '../services/notificationsService.js';

// GET /notifications/summary
export async function getSummary(request, reply) {
    // TODO: Extraer usuario autenticado (request.user o token)
    // TODO: Lógica para obtener sugerencias no confirmadas agrupadas por fecha
    const service = notificationsService(request.server.models);
    const userId = request.user?.id || 'demo-user';
    const summary = await service.getSummary(userId);
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


export async function confirmSuggestion(req, reply) {
  try {
    const { emailId, subject, from, action, category, confidenceScore, confirmed } = req.body;

    const saved = await Notification.create({
      emailId,
      subject,
      from,
      action,
      category,
      confidenceScore,
      confirmed,
      confirmedAt: new Date()
    });

    reply.send({ success: true, id: saved.id });
  } catch (err) {
    console.error("❌ Error al guardar confirmación:", err);
    reply.code(500).send({ error: 'No se pudo guardar la confirmación.' });
  }
}

