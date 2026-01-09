// tests/emailsRoutes.test.js
// Contrato Fastify para la ruta de correos (actualmente /api/v1/emails)
//
// Verifica:
// - Middleware de auth (401 sin Bearer).
// - 200 OK con token y shape { emails, nextPageToken, total }.
// - Que la ruta delega en emailController.listEmails (mockeado).

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import Fastify from 'fastify';

// 1) Mock del controlador para NO llamar Gmail ni el clasificador real
const mockListEmails = jest.fn(async (req, reply) => {
  // Verificamos que authMiddleware haya puesto el token
  expect(req.user).toEqual({ googleAccessToken: 'dummy-token' });

  return reply.send({
    emails: [
      {
        id: 'test-mail-1',
        from: 'demo@example.com',
        subject: 'Test HU12',
        date: '2025-11-15T00:00:00.000Z',
        isRead: false,
        category: 'promotions',
        attachmentSizeMb: 1.5
      }
    ],
    nextPageToken: null,
    total: 1
  });
});

// 2) Mockeamos el módulo del controlador ANTES de importar las rutas
jest.unstable_mockModule('../src/controllers/emailController.js', () => ({
  listEmails: mockListEmails
}));

// 3) Importamos las rutas ya con el controlador mockeado
const mailRoutesModule = await import('../src/routes/emailRoutes.js');
const mailRoutes = mailRoutesModule.default;

describe('Emails Routes (contrato Fastify /api/v1/emails)', () => {
  let app;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(mailRoutes, {prefix: 'api/v1'});
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/emails → 401 si no se envía Authorization', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/emails'
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Falta token o formato inválido' });
  });

  it('GET /api/v1/emails → 200 con Bearer token y shape esperado', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/emails',
      headers: {
        Authorization: 'Bearer dummy-token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    // Contrato mínimo
    expect(Array.isArray(body.emails)).toBe(true);
    expect(body.emails.length).toBeGreaterThan(0);

    const item = body.emails[0];
    expect(item).toMatchObject({
      id: 'test-mail-1',
      from: 'demo@example.com',
      subject: 'Test HU12'
    });

    // Campos de paginación básicos
    expect(body).toHaveProperty('nextPageToken');
    expect(body).toHaveProperty('total');
    expect(typeof body.total).toBe('number');

    // Verificamos que Fastify realmente haya llamado al controlador mockeado
    expect(mockListEmails).toHaveBeenCalledTimes(1);
  });
});

