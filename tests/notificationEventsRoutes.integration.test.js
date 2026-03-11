import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from 'jsonwebtoken';
import notificationsRoutes from '../src/routes/notificationsRoutes.js';
import { DOMAIN_EVENTS } from '../src/events/eventBus.js';

describe('notificationEvents route integration', () => {
  let app;
  let notificationEventModel;
  const jwtSecret = 'test-secret';
  const sessionToken = jwt.sign({ email: 'user@example.com' }, jwtSecret, { expiresIn: 3600 });

  beforeAll(async () => {
    process.env.INTERNAL_JWT_SECRET = jwtSecret;

    const rows = [
      {
        toJSON: () => ({
          type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
          userId: 'user@example.com',
          summary: { totalSuggestions: 2, sampledEmails: [] },
          createdAt: '2026-01-29T12:00:00.000Z',
          updatedAt: '2026-01-29T12:00:00.000Z'
        })
      },
      {
        toJSON: () => ({
          type: DOMAIN_EVENTS.SUGGESTION_CONFIRMED,
          userId: 'other-user',
          summary: { totalConfirmed: 1, action: 'accept' },
          createdAt: '2026-01-28T12:00:00.000Z',
          updatedAt: '2026-01-28T12:00:00.000Z'
        })
      }
    ];

    notificationEventModel = {
      findAndCountAll: jest.fn(async ({ where, limit, offset, order }) => {
        let filtered = rows
          .map((row) => row.toJSON())
          .filter((row) => {
            if (where.type && row.type !== where.type) return false;
            if (where.userId && row.userId !== where.userId) return false;
            return true;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const paged = filtered.slice(offset, offset + limit);

        return {
          count: filtered.length,
          rows: paged.map((row) => ({ toJSON: () => row }))
        };
      })
    };

    app = Fastify({ logger: false });
    app.decorate('models', { NotificationEvent: notificationEventModel });
    await app.register(cookie);
    await app.register(notificationsRoutes, { prefix: '/api/v1/notifications' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the real events contract with auth fallback to request.user.id', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/events?page=1&perPage=10',
      headers: {
        cookie: `session_token=${sessionToken}`
      }
    });

    expect(res.statusCode).toBe(200);
    expect(notificationEventModel.findAndCountAll).toHaveBeenCalledWith({
      where: { userId: 'user@example.com' },
      limit: 10,
      offset: 0,
      order: [['createdAt', 'DESC']]
    });

    const body = res.json();
    expect(body).toEqual({
      total: 1,
      page: 1,
      perPage: 10,
      data: [
        {
          type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
          userId: 'user@example.com',
          summary: { totalSuggestions: 2, sampledEmails: [] },
          createdAt: '2026-01-29T12:00:00.000Z',
          updatedAt: '2026-01-29T12:00:00.000Z'
        }
      ]
    });
  });

  it('applies explicit type and userId filters on the real service path', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/notifications/events?page=1&perPage=5&type=${DOMAIN_EVENTS.SUGGESTION_CONFIRMED}&userId=other-user`,
      headers: {
        cookie: `session_token=${sessionToken}`
      }
    });

    expect(res.statusCode).toBe(200);
    expect(notificationEventModel.findAndCountAll).toHaveBeenLastCalledWith({
      where: {
        type: DOMAIN_EVENTS.SUGGESTION_CONFIRMED,
        userId: 'other-user'
      },
      limit: 5,
      offset: 0,
      order: [['createdAt', 'DESC']]
    });

    const body = res.json();
    expect(body).toMatchObject({
      total: 1,
      page: 1,
      perPage: 5
    });
    expect(body.data[0]).toMatchObject({
      type: DOMAIN_EVENTS.SUGGESTION_CONFIRMED,
      userId: 'other-user',
      summary: { totalConfirmed: 1, action: 'accept' }
    });
  });
});
