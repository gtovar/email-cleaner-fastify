// tests/authMiddleware.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Fastify from 'fastify';
import authMiddleware from '../src/middlewares/authMiddleware.js';

describe('authMiddleware (contrato Bearer)', () => {
  let app;

  beforeAll(async () => {
    app = Fastify({ logger: false });

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

  it('responde 401 si NO se envía Authorization Bearer', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/protected'
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Falta token o formato inválido' });
  });

  it('acepta Authorization Bearer y rellena request.user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: {
        Authorization: 'Bearer dummy-token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      user: { googleAccessToken: 'dummy-token' }
    });
  });
});

