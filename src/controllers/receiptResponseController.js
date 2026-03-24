import { receiptResponseService } from '../services/receiptResponseService.js';

function buildService(request) {
  return receiptResponseService({
    models: request.server.models,
    logger: request.server.logger ?? request.server.log,
  });
}

export async function upsertReceiptResponse(request, reply) {
  const { targetId, response } = request.body ?? {};
  const userId = request.user?.id ?? 'demo-user';

  const service = buildService(request);

  const result = await service.upsert({
    userId,
    targetId,
    response,
  });

  return reply.code(200).send(result);
}

export async function getReceiptResponse(request, reply) {
  const { targetId } = request.params ?? {};
  const userId = request.user?.id ?? 'demo-user';

  const service = buildService(request);

  const result = await service.getCurrent({
    userId,
    targetId,
  });

  return reply.code(200).send(result);
}
