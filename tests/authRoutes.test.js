import { describe, it, expect, jest, beforeEach, beforeAll, afterAll } from '@jest/globals';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from 'jsonwebtoken';

const mockGenerateAuthUrl = jest.fn();
const mockGetToken = jest.fn();
const mockSetCredentials = jest.fn();
const mockOAuth2Instance = {
  generateAuthUrl: mockGenerateAuthUrl,
  getToken: mockGetToken,
  setCredentials: mockSetCredentials
};
const mockOAuth2 = jest.fn(() => mockOAuth2Instance);

jest.unstable_mockModule('googleapis', () => ({
  google: {
    auth: { OAuth2: mockOAuth2 }
  }
}));

const authRoutesModule = await import('../src/routes/authRoutes.js');
const authRoutes = authRoutesModule.default;

const buildIdToken = (email) => {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ email })).toString('base64url');
  return `${header}.${payload}.`;
};

const extractCookieValue = (cookieHeader, name) => {
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
};

describe('authRoutes OAuth state', () => {
  let app;
  const jwtSecret = 'test-secret';

  beforeAll(async () => {
    process.env.INTERNAL_JWT_SECRET = jwtSecret;
    process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 1).toString('base64');
    process.env.GOOGLE_CLIENT_ID = 'client';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

    app = Fastify({ logger: false });
    app.decorate('models', {
      Token: { upsert: jest.fn() }
    });
    await app.register(cookie);
    await app.register(authRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockGenerateAuthUrl.mockReset();
    mockGetToken.mockReset();
    mockSetCredentials.mockReset();
  });

  it('sets oauth_state cookie and includes state in redirect URL', async () => {
    mockGenerateAuthUrl.mockImplementation((options) => (
      `https://accounts.google.com/o/oauth2/v2/auth?state=${options.state}`
    ));

    const res = await app.inject({
      method: 'GET',
      url: '/auth/google'
    });

    expect(res.statusCode).toBe(302);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
    const stateCookie = extractCookieValue(cookieHeader, 'oauth_state');
    expect(stateCookie).toBeTruthy();
    expect(res.headers.location).toContain(`state=${stateCookie}`);
  });

  it('rejects callback when oauth_state is missing', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/auth/google/callback?code=abc'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('Invalid OAuth state');
  });

  it('rejects callback when oauth_state does not match', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/auth/google/callback?code=abc&state=wrong',
      headers: {
        cookie: 'oauth_state=expected'
      }
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('Invalid OAuth state');
  });

  it('accepts callback when oauth_state matches and clears cookie', async () => {
    mockGetToken.mockResolvedValue({
      tokens: {
        access_token: 'access-123',
        id_token: buildIdToken('user@example.com')
      }
    });

    const res = await app.inject({
      method: 'GET',
      url: '/auth/google/callback?code=abc&state=valid',
      headers: {
        cookie: 'oauth_state=valid'
      }
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('/auth/callback');
    const setCookie = res.headers['set-cookie'];
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
    expect(cookieHeader).toMatch(/session_token=/);
    expect(cookieHeader).toMatch(/oauth_state=/);
    expect(cookieHeader).toMatch(/Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
  });

  it('returns authenticated user from /api/v1/auth/me', async () => {
    const token = jwt.sign({ email: 'user@example.com' }, jwtSecret, { expiresIn: '1h' });
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie: `session_token=${token}`
      }
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ authenticated: true, email: 'user@example.com' });
  });

  it('rejects /api/v1/auth/me when no session token is present', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me'
    });

    expect(res.statusCode).toBe(401);
  });

  it('clears session cookie on /api/v1/auth/logout', async () => {
    const token = jwt.sign({ email: 'user@example.com' }, jwtSecret, { expiresIn: '1h' });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        cookie: `session_token=${token}`
      }
    });

    expect(res.statusCode).toBe(200);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
    expect(cookieHeader).toMatch(/session_token=/);
    expect(cookieHeader).toMatch(/Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
    expect(res.json()).toEqual({ success: true });
  });
});
