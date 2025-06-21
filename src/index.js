import Fastify from 'fastify';
import dbPlugin from './plugins/sequelize.js';

// Carga dotenv antes que nada
import 'dotenv/config';

const fastify = Fastify({ logger: true });

await fastify.register(dbPlugin);
await fastify.register(await import('./api/auth.routes.js'));

// Hello world para comprobar arranque
fastify.get('/', async (request, reply) => {
  return { message: '¡Email Cleaner Fastify corriendo OK con arquitectura modular!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Servidor Fastify listo en http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

