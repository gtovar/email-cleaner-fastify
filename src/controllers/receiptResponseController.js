import { receiptResponseService } from '../services/receiptResponseService.js';
import { resolveInboxSource } from '../services/inboxSources/index.js';

function buildService(request) {
  const targetResolver = async ({ targetId }) => {
    const inboxSource = resolveInboxSource({ logger: request.log });
    const content = await inboxSource.getEmailContent({
      server: request.server,
      email: request.user?.email,
      emailId: targetId,
    });

    return Boolean(content);
  };

  return receiptResponseService({
    models: request.server.models,
    logger: request.server.logger ?? request.server.log,
    resolveTarget: targetResolver,
  });
}

function handleReceiptResponseError(reply, error) {
  if (error?.statusCode === 404) {
    return reply.code(404).send({ error: error.message });
  }

  throw error;
}

export async function upsertReceiptResponse(request, reply) {
  try {
    const { targetId, response } = request.body ?? {};
    const userId = request.user?.id ?? 'demo-user';

    const service = buildService(request);

    const result = await service.upsert({
      userId,
      targetId,
      response,
    });

    return reply.code(200).send(result);
  } catch (error) {
    return handleReceiptResponseError(reply, error);
  }
}

export async function getReceiptResponse(request, reply) {
  try {
    const { targetId } = request.params ?? {};
    const userId = request.user?.id ?? 'demo-user';

    const service = buildService(request);

    const result = await service.getCurrent({
      userId,
      targetId,
    });

    return reply.code(200).send(result);
  } catch (error) {
    return handleReceiptResponseError(reply, error);
  }
}
