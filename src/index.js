import Fastify from 'fastify';
import dbPlugin from './plugins/sequelize.js';


const fastify = Fastify({ logger: true });
await fastify.register(dbPlugin);


// Rutas pueden vivir en src/api (mejor práctica, pero para el hello world la dejamos aquí)
fastify.get('/', async (request, reply) => {
  return { message: '¡Email Cleaner Fastify corriendo OK con arquitectura modular!' };
});

// Modularidad: aquí luego cargarás plugins, rutas externas, etc.

// Arranque del servidor
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
