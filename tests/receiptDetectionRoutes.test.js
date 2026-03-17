import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import receiptDetectionRoutes from '../src/routes/receiptDetectionRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, './fixtures/receiptDetection');

async function loadFixture(name) {
  const content = await readFile(path.join(FIXTURES_DIR, name), 'utf8');
  return JSON.parse(content);
}

describe('receiptDetectionRoutes', () => {
  let fastify;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(receiptDetectionRoutes, { prefix: '/api/v1' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('returns amount and due_date for a positive invoice', async () => {
    const fixture = await loadFixture('positive-clear-invoice.json');

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/receipt-detection/extract',
      payload: {
        subject: fixture.subject,
        body: fixture.body,
        html: fixture.html
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(fixture.expected);
  });

  it('returns null payload for ambiguous input', async () => {
    const fixture = await loadFixture('ambiguous-payment.json');

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/receipt-detection/extract',
      payload: {
        subject: fixture.subject,
        body: fixture.body,
        html: fixture.html
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ amount: null, due_date: null });
  });

  it('returns null payload for negative content', async () => {
    const fixture = await loadFixture('negative-promo.json');

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/receipt-detection/extract',
      payload: {
        subject: fixture.subject,
        body: fixture.body,
        html: fixture.html
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ amount: null, due_date: null });
  });

  it('returns null payload for empty input', async () => {
    const fixture = await loadFixture('empty-malformed.json');

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/receipt-detection/extract',
      payload: {
        subject: fixture.subject,
        body: fixture.body,
        html: fixture.html
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ amount: null, due_date: null });
  });

  it('returns 400 when payload is invalid', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/receipt-detection/extract',
      payload: {
        body: 'only body'
      }
    });

    expect(response.statusCode).toBe(400);
  });
});
