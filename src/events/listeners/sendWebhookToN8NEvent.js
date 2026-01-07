export function makeSendWebhookToN8NEvent({ models, logger }) {
  return async function sendWebhookToN8NEvent(domainEvent) {
    // TODO: implementación real (n8n) — por ahora no-op seguro
    logger?.info?.({ type: domainEvent?.type }, "sendWebhookToN8NEvent (noop)");
  };
}

