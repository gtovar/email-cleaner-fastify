import { notificationsService } from '../services/notificationsService.js';


// GET /api/v1/notifications/summary
export async function getSummary(request, reply) {
  const { models, eventBus } = request.server;
  const userId = request.user?.id ?? "demo-user";

  const service = notificationsService({ models, eventBus });

  const summary = await service.getSummaryForUser({ userId });

  return reply.send(summary);
}


// POST /api/v1/notifications/confirm
export async function confirmActions(request, reply) {
  const { emailIds, action } = request.body
  const userId = request.user?.id ?? 'demo-user';

  const service = notificationsService({
    models: request.server.models,
    eventBus: request.server.eventBus,
    logger: request.server.logger ?? request.server.log,
  });

    request.log.info({ body: request.body }, "confirm payload");

  const result = await service.confirmActions({ emailIds, action, userId  });

  return reply.code(200).send(result);
}
