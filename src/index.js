import Fastify from 'fastify';
import dbPlugin from './plugins/sequelize.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import cors from '@fastify/cors';
import eventBusPlugin from './plugins/eventBus.js';
import cookie from '@fastify/cookie';

// Carga dotenv antes que nada
import 'dotenv/config';

const createServer = async () => {
  const fastify = Fastify({ logger: true });

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
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'session_token'
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ cookieAuth: [] }, { bearerAuth: [] }]
    }
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true }
  });

  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  await fastify.register(cookie);
  await fastify.register(cors, {
    origin: frontendOrigin,
    credentials: true
  });

  await fastify.register(dbPlugin);
  await fastify.register(eventBusPlugin);
  await fastify.register(authRoutes);
  await fastify.register(emailRoutes, { prefix: "/api/v1" });
  await fastify.register(suggestionRoutes, { prefix: "/api/v1"});
  await fastify.register(notificationsRoutes, { prefix: "/api/v1/notifications" });

  fastify.get('/', async (request, reply) => {
    return { message: '¡Email Cleaner Fastify corriendo OK con arquitectura modular!' };
  });

  fastify.get('/api/v1/health/db', async (request, reply) => {
    try {
      await fastify.sequelize.query('SELECT 1');
      return reply.send({ db: 'ok' });
    } catch (e) {
      request.log.error(e);
      return reply.code(500).send({ db: 'error' });
    }
  });

  return fastify;
};

const start = async () => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          const port = Number(process.env.PORT) || 8080;
          const server = await createServer();
          await server.listen({ port, host: '0.0.0.0' });
          console.log(`Servidor Fastify listo en puerto ${port} (Cloud Run)`);
          return;
        }

        const portHttp = process.env.PORT_HTTP ? Number(process.env.PORT_HTTP) : 3000;

        const httpServer = await createServer();
        await httpServer.listen({ port: portHttp, host: '0.0.0.0' });
        console.log(`Servidor Fastify HTTP listo en http://localhost:${portHttp}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};



start();
