import { notificationEventsService } from '../services/notificationEventsService.js';

export async function listEvents(request, reply) {
  const { page = 1, perPage = 20, type, userId } = request.query;
  const effectiveUserId = userId || request.user?.id || 'demo-user';

  const service = notificationEventsService(request.server.models);
  const result = await service.list({ page, perPage, type, userId: effectiveUserId });

  return reply.send(result);
}

export async function confirmActionHandler(req, reply) {
  await confirmSuggestionCommand(...);
  return reply.code(204).send();
}

export async function getSummaryHandler(req, reply) {
  const summary = await getSummaryQuery(...);
  return reply.send(summary);
}
