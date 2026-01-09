import fp from 'fastify-plugin';
import { logger } from '../..';

async function loggerPlugin(fastify) {
  fastify.decorate('logger', logger);
}

export default fp(loggerPlugin);
