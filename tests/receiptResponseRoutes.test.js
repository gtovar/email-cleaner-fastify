import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import Fastify from 'fastify';

const createFakeReceiptResponseModel = () => {
  const store = new Map();

  const makeKey = ({ userId, emailId }) => `${userId}::${emailId}`;

  class FakeRow {
    constructor(data) {
      this.userId = data.userId;
      this.emailId = data.emailId;
      this.response = data.response;
      this.createdAt = data.createdAt ?? new Date();
      this.updatedAt = data.updatedAt ?? new Date();
    }

    async save() {
      this.updatedAt = new Date();
      store.set(
        makeKey({ userId: this.userId, emailId: this.emailId }),
        this,
      );
      return this;
    }
  }

  return {
    async findOne({ where }) {
      return (
        store.get(makeKey({ userId: where.userId, emailId: where.emailId })) ??
        null
      );
    },

    async create(data) {
      const row = new FakeRow(data);
      store.set(
        makeKey({ userId: data.userId, emailId: data.emailId }),
        row,
      );
      return row;
    },
  };
};

const fakeAuthMiddleware = async (request, reply) => {
  const userId = request.headers['x-test-user-id'];

  if (!userId) {
    return reply.code(401).send({ error: 'Missing or invalid auth token' });
  }

  request.user = {
    id: String(userId),
    email: `${userId}@example.com`,
  };
};

jest.unstable_mockModule('../src/middlewares/authMiddleware.js', () => ({
  default: fakeAuthMiddleware,
}));

const receiptResponseRoutesModule = await import(
  '../src/routes/receiptResponseRoutes.js'
);
const receiptResponseRoutes = receiptResponseRoutesModule.default;

describe('Receipt Response Routes (HU_07A)', () => {
  let app;

  beforeAll(async () => {
    app = Fastify({ logger: false });

    app.decorate('models', {
      ReceiptResponse: createFakeReceiptResponseModel(),
    });

    await app.register(receiptResponseRoutes, { prefix: '/api/v1' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('requires auth for POST', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      payload: {
        targetId: 'email-1',
        response: 'paid',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Missing or invalid auth token' });
  });

  test('requires auth for GET', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/receipt-responses/email-1',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Missing or invalid auth token' });
  });

  test('accepts paid', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-1',
        response: 'paid',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      targetId: 'email-1',
      response: 'paid',
    });
  });

  test('accepts ignore', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-2',
        response: 'ignore',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      targetId: 'email-2',
      response: 'ignore',
    });
  });

  test('rejects invalid response', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-3',
        response: 'unknown',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test('rejects missing targetId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        response: 'paid',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test('returns 200 + null state when not found', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/receipt-responses/email-not-found',
      headers: { 'x-test-user-id': 'user-a' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      targetId: 'email-not-found',
      response: null,
      updatedAt: null,
    });
  });

  test('creates initial state and can read it back', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-4',
        response: 'paid',
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/receipt-responses/email-4',
      headers: { 'x-test-user-id': 'user-a' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      targetId: 'email-4',
      response: 'paid',
    });
  });

  test('updates paid to ignore', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-5',
        response: 'paid',
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-5',
        response: 'ignore',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      targetId: 'email-5',
      response: 'ignore',
    });
  });

  test('updates ignore to paid', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-6',
        response: 'ignore',
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'email-6',
        response: 'paid',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      targetId: 'email-6',
      response: 'paid',
    });
  });

  test('isolates state by userId', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/receipt-responses',
      headers: { 'x-test-user-id': 'user-a' },
      payload: {
        targetId: 'shared-email',
        response: 'paid',
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/receipt-responses/shared-email',
      headers: { 'x-test-user-id': 'user-b' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      targetId: 'shared-email',
      response: null,
      updatedAt: null,
    });
  });
});
