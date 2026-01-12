// tests/authMiddleware.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from 'jsonwebtoken';
import authMiddleware from '../src/middlewares/authMiddleware.js';

describe('authMiddleware (cookie session)', () => {
  let app;
  const jwtSecret = 'test-secret';
  const sessionToken = jwt.sign({ email: 'user@example.com' }, jwtSecret, { expiresIn: 3600 });

  beforeAll(async () => {
    app = Fastify({ logger: false });
    process.env.INTERNAL_JWT_SECRET = jwtSecret;
    await app.register(cookie);

    // Ruta dummy para probar solo el middleware
    app.get('/protected', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      // Verificamos que el middleware haya puesto request.user
      return reply.send({ user: request.user });
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 401 si no se envía cookie de sesión', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/protected'
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Missing or invalid auth token' });
  });

  it('acepta cookie de sesión y rellena request.user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: {
        cookie: `session_token=${sessionToken}`
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user).toMatchObject({ email: 'user@example.com' });
  });
});
