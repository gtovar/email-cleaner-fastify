import fp from 'fastify-plugin';
import { eventBus } from '../events/eventBus.js';
import { registerNotificationEventListeners } from '../events/registernotificationEventListeners.js';

async function eventBusPlugin(fastify) {
  fastify.decorate('eventBus', eventBus);

  registerNotificationEventListeners({ 
    eventBus,
    models: fastify.models,
    logger: fastify.logger,
  });

  fastify.log.info("EventBus plugin initialized");
}

export default fp(eventBusPlugin);
