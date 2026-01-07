// src/events/registerSubscribers.js
// Es un verbo: “registra los listeners”.
// Registrar = función que agrupa suscripciones:
// registerNotificationEventListeners(...)
// Crea listeners.
// Los suscribe.
import { makeSaveToNotificationEventListener } from "../listeners/saveToNotificationEvent.js";
import { makeDebugLogEventListener } from "../listeners/debugLogEvent.js";
import { makeSendWebhookToN8NEvent } from "../listeners/sendWebhookToN8NEvent.js";
import { DOMAIN_EVENTS } from "../eventBus.js";


export function registerNotificationEventListeners({ eventBus, models, logger }) {
  const saveToNotificationEvent = makeSaveToNotificationEventListener({
    models,
    logger,
  });

  const debugLogEvent = makeDebugLogEventListener({ logger });

  const sendWebhookToN8N = makeSendWebhookToN8NEvent({
    models,
    logger,
  })
  // Suscripciones
  eventBus.subscribe(DOMAIN_EVENTS.SUGGESTIONS_GENERATED, saveToNotificationEvent);
  eventBus.subscribe(DOMAIN_EVENTS.SUGGESTION_CONFIRMED, saveToNotificationEvent);
  eventBus.subscribe(DOMAIN_EVENTS.SUGGESTIONS_GENERATED, debugLogEvent);
  eventBus.subscribe(DOMAIN_EVENTS.SUGGESTIONS_GENERATED, sendWebhookToN8N);
  logger?.info?.({models}, "NotificationEvent stored from domain event");
}
