// src/events/listeners/saveToNotificationEvent.js
import { notificationEventsService } from "../../services/notificationEventsService.js";

export function makeSaveToNotificationEventListener({ models, logger }) {
  const eventsService = notificationEventsService(models);

  return async function saveToNotificationEvent(event) {
    if (!domainEvent) return;
    await eventsService.record(domainevent);
    logger?.info(
      { type: domainEvent.type, userId: event.userId },
      "Notification stored"
    );
  };
}

