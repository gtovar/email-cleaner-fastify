import { DOMAIN_EVENTS } from "../../events/eventBus.js";
import { buildConfirmedSuggestionEvent } from '../../events/builders/confirmedSuggestionEvent.builder.js';

export async function confirmActionCommand({ models, eventBus, logger, userId, emailIds, action }) {
  const { ActionHistory } = models;

  // 1) Registrar acción
  await ActionHistory.bulkCreate(
    emailIds.map(id => ({
      userId,
      emailId: id,
      action,
      timestamp: new Date().toISOString()
    }))
  );

  // 2) Emitir eventos (si usas EventBus / EventStore)
  if (emailIds.length > 0) {
    const domainEvent = buildConfirmedSuggestionEvent({ userId, emailIds, action });
    await eventBus.publish(DOMAIN_EVENTS.SUGGESTION_CONFIRMED, domainEvent);
  }

  // 3) Cualquier otra lógica de dominio
  logger.info({ userId, action, count: emailIds.length }, "Suggestion confirmed");

  return { success: true, processed: emailIds.length };
}
