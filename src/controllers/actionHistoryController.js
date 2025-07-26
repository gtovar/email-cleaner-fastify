import { actionHistoryService } from '../services/actionHistoryService.js';

export async function getHistory(request, reply) {
  const { page = 1, perPage = 20 } = request.query;
  const userId = request.user?.id || 'demo-user';

  const service = actionHistoryService(request.server.models); // ✅ importante
  const history = await service.getHistory({ userId, page, perPage });

  return reply.send(history);
};
