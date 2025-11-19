// tests/mlClient.test.js
// Tests for src/services/mlClient.js
//
// Verifies:
// - buildMlUrl: correct URL construction.
// - postJson: success, HTTP error, timeout and network error cases.
// - classifyEmails: type validation and default endpoint usage.

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest
} from '@jest/globals';

const ORIGINAL_ENV = { ...process.env };

/**
 * Helper to load the mlClient module **after** configuring process.env
 * and to handle CJS/ESM interop.
 */
async function loadMlClient(extraEnv = {}) {
  process.env = { ...process.env, ...extraEnv };

  const imported = await import('../src/services/mlClient.js');
  // mlClient.js uses `module.exports = { ... }` (CommonJS),
  // so in ESM interop we may get exports directly or under `default`.
  const mlClient = imported.default || imported;

  return mlClient;
}

describe('mlClient service', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Reset env and provide sane defaults for tests
    process.env = { ...ORIGINAL_ENV };

    // Fresh fetch mock for each test
    // eslint-disable-next-line no-undef
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    // eslint-disable-next-line no-undef
    delete global.fetch;
  });

  describe('buildMlUrl', () => {
    test('builds URL joining base and path correctly', async () => {
      const mlClient = await loadMlClient({ ML_BASE_URL: 'http://ml:8000/' });
      const { buildMlUrl, ML_BASE_URL } = mlClient;

      expect(ML_BASE_URL).toBe('http://ml:8000/');
      expect(buildMlUrl('/v1/test')).toBe('http://ml:8000/v1/test');
    });

    test('accepts paths without leading slash', async () => {
      const mlClient = await loadMlClient({ ML_BASE_URL: 'http://ml:8000' });
      const { buildMlUrl } = mlClient;

      expect(buildMlUrl('v1/test')).toBe('http://ml:8000/v1/test');
    });
  });

  describe('postJson', () => {
    test('returns JSON when response is ok', async () => {
      const fakeJson = { ok: true, foo: 'bar' };

      // eslint-disable-next-line no-undef
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => fakeJson
      });

      const { postJson } = await loadMlClient({ ML_BASE_URL: 'http://ml:8000' });

      const result = await postJson('/v1/test', { foo: 'bar' });

      // eslint-disable-next-line no-undef
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // eslint-disable-next-line no-undef
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe('http://ml:8000/v1/test');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      const parsedBody = JSON.parse(options.body);
      expect(parsedBody).toEqual({ foo: 'bar' });

      expect(result).toEqual(fakeJson);
    });

    test('throws MlServiceError when response is not ok', async () => {
      // eslint-disable-next-line no-undef
      global.fetch.mockResolvedValue({
        ok: false,
        status: 502,
        text: async () => 'Bad gateway'
      });

      const { postJson } = await loadMlClient({ ML_BASE_URL: 'http://ml:8000' });

      await expect(
        postJson('/v1/test', { foo: 'bar' })
      ).rejects.toMatchObject({
        name: 'MlServiceError',
        statusCode: 502
      });

      try {
        await postJson('/v1/test', { foo: 'bar' });
      } catch (err) {
        // We only care that body is present (string or null), not its exact content.
        expect(err.body).toBeDefined();
      }
    });

    test('throws MlServiceTimeoutError when fetch rejects with AbortError', async () => {
      const abortError = new Error('aborted');
      abortError.name = 'AbortError';

      // eslint-disable-next-line no-undef
      global.fetch.mockRejectedValue(abortError);

      const { postJson } = await loadMlClient({
        ML_BASE_URL: 'http://ml:8000',
        ML_TIMEOUT_MS: '10'
      });

      await expect(
        postJson('/v1/test', { foo: 'bar' }, { timeoutMs: 20 })
      ).rejects.toMatchObject({
        name: 'MlServiceTimeoutError',
        code: 'ML_TIMEOUT'
      });
    });

    test('throws MlServiceNetworkError for other network errors', async () => {
      const netError = new Error('network down');

      // eslint-disable-next-line no-undef
      global.fetch.mockRejectedValue(netError);

      const { postJson } = await loadMlClient({ ML_BASE_URL: 'http://ml:8000' });

      await expect(
        postJson('/v1/test', { foo: 'bar' })
      ).rejects.toMatchObject({
        name: 'MlServiceNetworkError'
      });

      try {
        await postJson('/v1/test', { foo: 'bar' });
      } catch (err) {
        expect(err.cause).toBe(netError);
      }
    });
  });

  describe('classifyEmails', () => {
      
      test('throws TypeError if emails is not an array', async () => {
          const { classifyEmails } = await loadMlClient();

          await expect(
              classifyEmails(null)
          ).rejects.toBeInstanceOf(TypeError);

          await expect(
              classifyEmails({})
          ).rejects.toThrow('classifyEmails: "emails" must be an array');
      });

    test('sends emails to default endpoint /v1/emails/classify', async () => {
      const fakeResponse = { result: 'ok' };

      // eslint-disable-next-line no-undef
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => fakeResponse
      });

      const { classifyEmails } = await loadMlClient({
        ML_BASE_URL: 'http://ml:8000'
      });

      const emails = [{ id: 1 }, { id: 2 }];

      const result = await classifyEmails(emails);

      // eslint-disable-next-line no-undef
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // eslint-disable-next-line no-undef
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe('http://ml:8000/v1/emails/classify');

      const parsedBody = JSON.parse(options.body);
      expect(parsedBody).toHaveProperty('emails');
      expect(parsedBody.emails).toEqual(emails);

      expect(result).toEqual(fakeResponse);
    });
  });
});
