import { notificationsService } from '../services/notificationsService.js';
import { confirmSuggestionCommand } from "../commands/notifications/confirmSuggestionCommand.js";
import { confirmActionCommand } from "../commands/notifications/confirmActionCommand.js";
import { getHistoryQuery } from "../queries/notifications/getHistoryQuery.js";
import { getEventQuery } from "../queries/notifications/getEventQuery.js";

// GET /api/v1/notifications/summary
export async function getSummary(request, reply) {
  const { models, eventBus } = request.server;
  const userId = request.user?.id ?? "demo-user";

  const service = notificationsService({ models, eventBus });

  const summary = await service.getSummaryForUser({ userId });

  return reply.send(summary);
}

// GET /api/v1/notifications/history  Queries
export async function getHistory(request, reply) {
  const userId = request.user?.id ?? "demo-user";
  const history = await getHistoryQuery({
    models: request.server.models,
    userId,
  });

  return reply.send(history);
}

// GET /api/v1/notifications/events   Queries
export async function getEvents(request, reply) {
  const { page = 1, perPage = 20, type, userId } = request.query;
  const effectiveUserId = userId || request.user?.id || 'demo-user';

  const events = await getEventsQuery({
    models: request.server.models,
    userId,
    pag:
  });

  return reply.send(events);
}


// POST /api/v1/notifications/confirm
export async function confirmAction(request, reply) {
  await confirmActionCommand({  ids, action, userId })
});

return reply.code(204).send();
}

//POST /api/v1/notifications/confirm
export async function confirmSuggestion(request, reply) {
  try {
    await confirmSuggestionCommand({ models, eventBus, logger, userId, emailIds, action }) {
      const { ids, action } = request.body;
      const userId = request.user?.id || 'demo-user';
      await confirmSuggestionCommand({
        models: request.server.models,
        eventBus: request.server.eventBus,
        logger: request.server.logger,
        userId: userId,
        emailIds: ids,
        action: action,
      });

      return reply.code(201).send({ ok: true, id: saved.id });
    } catch (err) {
      console.error("❌ Error al guardar confirmación:", err);
      return reply.code(500).send({ ok: false, error: 'No se pudo guardar la confirmación.' });
    }
  }
}
