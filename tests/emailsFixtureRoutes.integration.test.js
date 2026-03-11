import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import cookie from '@fastify/cookie';
import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import emailRoutes from '../src/routes/emailRoutes.js';

describe('Emails route with fixture inbox source', () => {
  let app;
  const jwtSecret = 'test-secret';

  beforeAll(async () => {
    process.env.INTERNAL_JWT_SECRET = jwtSecret;
    process.env.INBOX_SOURCE = 'fixture';
    app = Fastify({ logger: false });
    await app.register(cookie);
    await app.register(emailRoutes, { prefix: '/api/v1' });
    await app.ready();
  });

  afterAll(async () => {
    delete process.env.INBOX_SOURCE;
    await app.close();
  });

  it('returns the deterministic HU19 fixture inbox for the fixture user', async () => {
    const sessionToken = jwt.sign({ email: 'e2e-user@example.com' }, jwtSecret, { expiresIn: 3600 });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/emails',
      headers: {
        cookie: `session_token=${sessionToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.total).toBe(3);
    expect(body.nextPageToken).toBeNull();
    expect(body.emails.map((item) => item.id)).toEqual([
      'email-hu19-archive',
      'email-hu19-delete',
      'email-hu19-read',
    ]);
  });

  it('keeps auth real and returns an empty inbox for non-fixture users', async () => {
    const sessionToken = jwt.sign({ email: 'other-user@example.com' }, jwtSecret, { expiresIn: 3600 });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/emails',
      headers: {
        cookie: `session_token=${sessionToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      emails: [],
      nextPageToken: null,
      total: 0,
    });
  });
});
