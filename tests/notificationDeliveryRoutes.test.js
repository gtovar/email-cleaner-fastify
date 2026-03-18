import Fastify from 'fastify';
import { jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

jest.unstable_mockModule('../src/services/notifications/receiptNotificationService.js', () => ({
  notifyReceipt: jest.fn(),
}));

const { default: notificationDeliveryRoutes } = await import('../src/routes/notificationDeliveryRoutes.js');
const { notifyReceipt } = await import('../src/services/notifications/receiptNotificationService.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, './fixtures/notifications');

async function loadFixture(name) {
  const content = await readFile(path.join(FIXTURES_DIR, `${name}.json`), 'utf8');
  return JSON.parse(content);
}

describe('notificationDeliveryRoutes', () => {
  let fastify;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(notificationDeliveryRoutes, { prefix: '/api/v1' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns success for ready payload', async () => {
    const fixture = await loadFixture('positive-ready-to-send');
    notifyReceipt.mockResolvedValue({
      sent: true,
      provider: 'twilio',
      status: 'sent',
      providerMessageId: 'twilio-sandbox-message-id',
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/notifications/receipt-whatsapp',
      payload: fixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      sent: true,
      provider: 'twilio',
      status: 'sent',
      providerMessageId: 'twilio-sandbox-message-id',
    });
    expect(notifyReceipt).toHaveBeenCalledWith(fixture);
  });

  it('returns skipped when amount is missing', async () => {
    const fixture = await loadFixture('missing-amount');
    notifyReceipt.mockResolvedValue({
      sent: false,
      reason: 'missing_extracted_fields',
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/notifications/receipt-whatsapp',
      payload: fixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      sent: false,
      reason: 'missing_extracted_fields',
    });
  });

  it('returns skipped when due_date is missing', async () => {
    const fixture = await loadFixture('missing-due-date');
    notifyReceipt.mockResolvedValue({
      sent: false,
      reason: 'missing_extracted_fields',
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/notifications/receipt-whatsapp',
      payload: fixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      sent: false,
      reason: 'missing_extracted_fields',
    });
  });

  it('returns provider error when delivery fails', async () => {
    const fixture = await loadFixture('provider-failure');
    notifyReceipt.mockResolvedValue({
      sent: false,
      reason: 'provider_error',
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/notifications/receipt-whatsapp',
      payload: fixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      sent: false,
      reason: 'provider_error',
    });
  });

  it('returns 400 for invalid payload', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/notifications/receipt-whatsapp',
      payload: {
        sender: 'CFE',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
