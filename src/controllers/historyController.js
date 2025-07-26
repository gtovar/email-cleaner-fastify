import { actionHistoryService } from '../services/actionHistoryService.js';

export async function getHistory(request, reply) {
  const userId = request.user?.id || 'demo-user';
  const page = parseInt(request.query.page) || 1;
  const perPage = parseInt(request.query.perPage) || 20;

  const service = actionHistoryService(request.server.models); // ✅ correcto

  const result = await service.getHistory({ userId, page, perPage });

  return reply.send(result);
}

