import Fastify from 'fastify';
import dbPlugin from './plugins/sequelize.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
// Carga dotenv antes que nada
import 'dotenv/config';

// Instancia de fastify
const fastify = Fastify({ logger: true });

// Swagger setup (no uses require, usa import)

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Email Cleaner API',
      version: '1.0.0',
      description: 'API para listar correos de Gmail con filtros personalizados.'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  }
});

await fastify.register(swaggerUI, {
  routePrefix: '/docs'
});

// Registro de plugins y rutas (nota los imports dinámicos)
await fastify.register(dbPlugin);
await fastify.register(await import('./routes/authRoutes.js'));
await fastify.register(await import('./routes/mailRoutes.js'));

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

