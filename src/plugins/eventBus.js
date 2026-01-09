// src/plugins/eventBus.js
import fp from 'fastify-plugin';
import { eventBus } from '../events/eventBus.js';
import { registerNotificationEventListeners } from '../events/subscribers/registerNotificationEventListeners.js';

/**
 * Plugin de Fastify para exponer el EventBus y registrar listeners de dominio.
 *
 * - Decora fastify con `eventBus` para que esté disponible en services/controllers:
 *     request.server.eventBus
 *
 * - Registra los listeners de notificación usando las dependencias de Fastify:
 *     models (Sequelize) y log (Pino).
 */
async function eventBusPlugin(fastify) {
  // Exponemos el bus como parte del "container" de Fastify
  fastify.decorate('eventBus', eventBus);

  // Registramos listeners con DI explícita
  registerNotificationEventListeners({
    eventBus,
    models: fastify.models,
    logger: fastify.log,
  });

  fastify.log.info("EventBus plugin initialized");
}

export default fp(eventBusPlugin);

