import models from "../models"
import eventBus from "../events/eventBus"
import logger from "../logger"

export async function confirmActionCommand({ models, eventBus, logger, userId, emailIds, action }) {
  const { ActionsHistory } = models;

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
    eventBus.publish("suggestion.confirmed", { type, userId, summary, createdAt, updateAt });
  }

  // 3) Cualquier otra lógica de dominio
  logger.info({ userId, action, count: emailIds.length }, "Suggestion confirmed");

  return { ok: true };
}
