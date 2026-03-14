import { inboxActionsService } from '../services/inboxActionsService.js';

// POST /api/v1/inbox/actions
export async function runInboxActions(request, reply) {
  const { emailIds, action } = request.body;
  const userId = request.user?.id ?? 'demo-user';

  const service = inboxActionsService({
    models: request.server.models,
    logger: request.server.logger ?? request.server.log,
  });

  request.log.info(
    { count: Array.isArray(emailIds) ? emailIds.length : 0, action, source: 'inbox' },
    'inbox actions payload'
  );

  const result = await service.runActions({ emailIds, action, userId });

  return reply.code(200).send(result);
}
