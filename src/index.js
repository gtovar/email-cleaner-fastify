import Fastify from 'fastify';
import dbPlugin from './plugins/sequelize.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import authRoutes from './routes/authRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import cors from '@fastify/cors';


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
await fastify.register(authRoutes);
await fastify.register(mailRoutes);
await fastify.register(suggestionRoutes);
await fastify.register(notificationsRoutes);


// Healthcheck
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

await fastify.register(cors, {
  origin: 'http://localhost:5173', // Solo acepta peticiones desde el frontend
  credentials: true
});


start();

