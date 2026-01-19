import Fastify from 'fastify';
import fs from 'fs';
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

const resolveHttpsConfig = () => {
  const keyPath = process.env.TLS_KEY_PATH;
  const certPath = process.env.TLS_CERT_PATH;
  if (!keyPath || !certPath) {
    return null;
  }
  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
};

const createServer = async ({ https } = {}) => {
  const fastify = Fastify({ logger: true, https });

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
        const portHttps = process.env.PORT_HTTPS ? Number(process.env.PORT_HTTPS) : 3000;
        const portHttp = process.env.PORT_HTTP ? Number(process.env.PORT_HTTP) : 3001;
        const httpsConfig = resolveHttpsConfig();

        const httpServer = await createServer();
        await httpServer.listen({ port: portHttp, host: '0.0.0.0' });
        console.log(`Servidor Fastify HTTP listo en http://localhost:${portHttp}`);

        if (httpsConfig) {
          const httpsServer = await createServer({ https: httpsConfig });
          await httpsServer.listen({ port: portHttps, host: '0.0.0.0' });
          console.log(`Servidor Fastify HTTPS listo en https://localhost:${portHttps}`);
        } else {
          console.warn('TLS no configurado; HTTPS deshabilitado.');
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};



start();
