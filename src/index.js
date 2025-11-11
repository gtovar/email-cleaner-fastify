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
    tags: [
      { name: 'official-v1', description: 'Contratos estables mantenidos en v1' },
      { name: 'experimental', description: 'Endpoints sujetos a cambio' }
    ],
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
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list', deepLinking: true }
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

// Healthcheck
fastify.get('/api/v1/health/db', async (request, reply) => {
  try {
    await fastify.sequelize.query('SELECT 1');
    return reply.send({ db: 'ok' });
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send({ db: 'error' });
  }
});

await fastify.register(cors, {
    origin: 'http://localhost:5173', // Solo acepta peticiones desde el frontend
    credentials: true
});

const start = async () => {
    try {
        const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log('Servidor Fastify listo en http://localhost:' + PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};



start();

