import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from 'jsonwebtoken';

const mockRunInboxActions = jest.fn(async (req, reply) => {
  expect(req.body).toEqual({
    emailIds: ['email-1'],
    action: 'archive',
  });

  return reply.send({
    success: true,
    execution: 'full',
    action: 'archive',
    source: 'inbox',
    summary: {
      total: 1,
      processed: 1,
      failed: 0,
    },
    results: [{ emailId: 'email-1', status: 'ok' }],
  });
});

jest.unstable_mockModule('../src/controllers/inboxActionsController.js', () => ({
  runInboxActions: mockRunInboxActions,
}));

const inboxRoutesModule = await import('../src/routes/inboxRoutes.js');
const inboxRoutes = inboxRoutesModule.default;

describe('Inbox Routes (contract)', () => {
  let app;
  const jwtSecret = 'test-secret';
  const sessionToken = jwt.sign({ email: 'user@example.com' }, jwtSecret, { expiresIn: 3600 });

  beforeAll(async () => {
    app = Fastify({ logger: false });
    process.env.INTERNAL_JWT_SECRET = jwtSecret;
    await app.register(cookie);
    await app.register(inboxRoutes, { prefix: '/api/v1/inbox' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/inbox/actions -> 401 without auth', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inbox/actions',
      payload: {
        emailIds: ['email-1'],
        action: 'archive',
      },
    });

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ error: 'Missing or invalid auth token' });
  });

  it('POST /api/v1/inbox/actions -> 200 with valid cookie and body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inbox/actions',
      headers: {
        cookie: `session_token=${sessionToken}`,
        'content-type': 'application/json',
      },
      payload: JSON.stringify({
        emailIds: ['email-1'],
        action: 'archive',
      }),
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      success: true,
      execution: 'full',
      action: 'archive',
      source: 'inbox',
      summary: {
        total: 1,
        processed: 1,
        failed: 0,
      },
      results: [{ emailId: 'email-1', status: 'ok' }],
    });
    expect(mockRunInboxActions).toHaveBeenCalledTimes(1);
  });
});
