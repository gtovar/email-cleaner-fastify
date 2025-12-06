// src/events/registerSubscribers.js
// Es un verbo: “registra los listeners”.
// Registrar = función que agrupa suscripciones:
// registerNotificationEventListeners(...)
// Crea listeners.
// Los suscribe.
import { eventBus } from "./eventBus.js";
import { makeSaveToNotificationEventListener } from "./listeners/saveToNotificationEvent.js";
import { makeDebugLogEventListener } from "./listeners/debugLogEvent.js";
import { makeSendWebhookToN8NEvent } from "./listeners/sendWebhookToN8NEvent.js";

export function registerNotificationEventListeners({ eventBus, models, logger }) {
    const saveToNotificationEvent = makeSaveToNotificationEventListener({
        models,
        logger,
    });

    const debugLogEvent = makeDebugLogEventListener({ logger });

    const sendWebhookToN8N = makeSendWehookToN8nEvent({
        models,
        logger,
    })
    // Suscripciones
    eventBus.subscribe("suggestion.generated", saveToNotificationEvent);
    eventBus.subscribe("suggestion.generated", debugLogEvent);
    eventBus.subscribe("suggestion.generated", sendWebhookToN8N);
    logger?.info("Subscribers registered for 'suggestion.generated'");

}

