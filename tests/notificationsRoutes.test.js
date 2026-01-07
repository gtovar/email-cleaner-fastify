// tests/notificationsRoutes.test.js
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import Fastify from 'fastify';
import { DOMAIN_EVENTS } from '../src/events/eventBus.js';

// 1) Mocks del controlador de notificaciones
const mockGetSummary = jest.fn(async (req, reply) => {
  expect(req.user).toEqual({ googleAccessToken: 'dummy-token' });

  return reply.send([
    {
      id: 'test1',
      from: 'noti@demo.com',
      subject: '¡Prueba HU4!',
      date: '2025-11-14T06:59:21.250Z',
      isRead: false,
      category: 'demo',
      attachmentSizeMb: 0.1,
      suggestions: ['archive']
    }
  ]);
});

const mockConfirmActions = jest.fn(async (req, reply) => {
  expect(req.body).toEqual({
    emailIds: ['test1'],
    action: 'accept'
  });

  return reply.send({
    success: true,
    processed: 1,
    emailIds: req.body.emailIds,
    action: req.body.action
  });
});

const mockGetHistory = jest.fn(async (req, reply) => {
  expect(req.user).toEqual({ googleAccessToken: 'dummy-token' });

  return reply.send({
    total: 1,
    page: 1,
    perPage: 20,
    data: [
      {
        userId: 'demo-user',
        emailId: 'test1',
        action: 'accept',
        timestamp: '2025-11-14T07:11:20.364Z',
        details: {}
      }
    ]
  });
});

// 2) Mockeamos los módulos de controladores ANTES de importar las rutas
jest.unstable_mockModule('../src/controllers/notificationsController.js', () => ({
  getSummary: mockGetSummary,
  confirmActions: mockConfirmActions
}));

jest.unstable_mockModule('../src/controllers/actionHistoryController.js', () => ({
  getHistory: mockGetHistory
}));

const mockListEvents = jest.fn(async (req, reply) => {
  expect(req.query).toMatchObject({ page: 2, perPage: 5, type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED, userId: 'demo-user' });
  return reply.send({
    total: 1,
    page: 2,
    perPage: 5,
    data: [
      {
        type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
        userId: 'demo-user',
        summary: { totalSuggestions: 3, sampledEmails: [] },
        createdAt: '2025-11-14T07:15:00.000Z',
        updatedAt: '2025-11-14T07:15:00.000Z'
      }
    ]
  });
});

jest.unstable_mockModule('../src/controllers/notificationEventsController.js', () => ({
  listEvents: mockListEvents
}));

// 3) Importamos las rutas ya con los controladores mockeados
const notificationsRoutesModule = await import('../src/routes/notificationsRoutes.js');
const notificationsRoutes = notificationsRoutesModule.default;

describe('Notifications Routes (contrato Fastify)', () => {
  let app;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(notificationsRoutes, { prefix: '/api/v1/notifications' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/notifications/summary → 401 si no se envía Authorization', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/summary'
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Falta token o formato inválido' });
  });

  it('GET /api/v1/notifications/summary → 200 con Bearer token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/summary',
      headers: {
        Authorization: 'Bearer dummy-token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    const item = body[0];
    expect(item).toMatchObject({
      id: 'test1',
      subject: '¡Prueba HU4!',
      suggestions: ['archive']
    });

    expect(mockGetSummary).toHaveBeenCalledTimes(1);
  });

  it('POST /api/v1/notifications/confirm → 401 sin token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/notifications/confirm',
      payload: {
        emailIds: ['test1'],
        action: 'accept'
      }
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Falta token o formato inválido' });
  });

  it('POST /api/v1/notifications/confirm → 200 con token y body válido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/notifications/confirm',
      headers: {
        Authorization: 'Bearer dummy-token',
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        emailIds: ['test1'],
        action: 'accept'
      })
    });
  // DEBUG: si falla, imprime body para ver el error real del 500
  if (res.statusCode !== 200) {
    // eslint-disable-next-line no-console
    console.log('DEBUG confirm status=', res.statusCode);
    // eslint-disable-next-line no-console
    console.log('DEBUG confirm body=', res.body);
  }

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body).toEqual({
      success: true,
      processed: 1,
      emailIds: ['test1'],
      action: 'accept'
    });

    expect(mockConfirmActions).toHaveBeenCalledTimes(1);
  });

  it('GET /api/v1/notifications/history → 401 sin token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/history'
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Falta token o formato inválido' });
  });

  it('GET /api/v1/notifications/history → 200 con token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/history',
      headers: {
        Authorization: 'Bearer dummy-token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body).toMatchObject({
      total: 1,
      page: 1,
      perPage: 20
    });

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(1);

    expect(mockGetHistory).toHaveBeenCalledTimes(1);
  });

  it('GET /api/v1/notifications/events → 401 sin token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/events'
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Falta token o formato inválido' });
  });

  it('GET /api/v1/notifications/events → 200 con token y filtro userId', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/events?page=2&perPage=5&type=domain.suggestions.generated&userId=demo-user',
      headers: {
        Authorization: 'Bearer dummy-token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body).toMatchObject({
      total: 1,
      page: 2,
      perPage: 5
    });

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0]).toMatchObject({
      type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED, userId: 'demo-user'
    });

    expect(mockListEvents).toHaveBeenCalledTimes(1);
  });
});
