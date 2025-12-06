import fp from 'fastify-plugin';
import { mlClient } from '../..';

async function mlClientPlugin(fastify) {
  fastify.decorate('mlClient', mlClient);
}

export default fp(mlClientPlugin);
