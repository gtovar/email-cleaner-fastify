import { actionHistoryService } from '../services/actionHistoryService.js';

export async function getHistory(request, reply) {
  const { page = 1, perPage = 20 } = request.query;
  const userId = request.user?.id || 'demo-user';

  const service = actionHistoryService(request.server.models); // ✅ importante
  const history = await service.getHistory({ userId, page, perPage });

  return reply.send(history);
};

export async function confirmActionHandler(req, reply) {
  await confirmSuggestionCommand({
      models: req.server.models,
      userId: req.user.id,
      emailIds: req.body.ids,
      action: req.body.action,
    });

  return reply.code(204).send();
}

export async function getSummaryHandler(req, reply) {
  const result = await getSummaryQuery({
      models: req.server.models,
      userId: req.user.id,
    });

  return reply.send(result);
}

