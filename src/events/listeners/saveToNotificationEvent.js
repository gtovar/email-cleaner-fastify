// src/events/listeners/saveToNotificationEvent.js

import { recordNotificationEventCommand } from "../../commands/notification_events/recordNotificationEventCommand.js";

/**
 * Listener para guardar eventos en NotificationEvent (EventStore HU16).
 *
 * Espera recibir domainEvent con forma:
 * {
 *   type: string,
 *   userId: string,
 *   summary: { totalSuggestions: number, sampledEmails: array },
 *   suggestions?: array,
 *   generatedAt?: string
 * }
 *
 * Regla: NO recalcula summary aquí. Si falta summary, se rechaza (para evitar "dos verdades").
 */
export function makeSaveToNotificationEventListener({ models, logger }) {
  const cmd = recordNotificationEventCommand({ models, logger });

  return async function saveToNotificationEvent(domainEvent) {
    const type = domainEvent?.type;
    const userId = domainEvent?.userId;
    const summary = domainEvent?.summary;

    if (!type || !userId) {
      logger?.warn?.({ domainEvent }, "Event missing type/userId; skipping persist");
      return;
    }

    if (!summary) {
      logger?.warn?.({ domainEvent }, "Event missing summary; skipping persist to avoid duplication");
      return;
    }

    await cmd.execute({
      type,
      userId,
      summary,
      // si tu Command soporta guardar más cosas en el futuro, aquí se pasan
      // payloadRef, payloadBytes, generatedAt, etc.
    });

    logger?.info?.(
      { userId, type, totalSuggestions: summary.totalSuggestions },
      "NotificationEvent persisted via command"
    );
  };
}
