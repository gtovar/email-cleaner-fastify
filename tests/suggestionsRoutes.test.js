// tests/suggestionsRoutes.test.js
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from 'jsonwebtoken';

// Mock del controlador de sugerencias para no llamar Gmail ni Python
const mockGetSuggestedEmails = jest.fn(async (req, reply) => {
  // Verificamos que el middleware de auth haya puesto el token en request.user
  expect(req.user).toMatchObject({ email: 'user@example.com' });

  return reply.send({
    emails: [
      {
        id: 'abc123',
        from: 'notificaciones@ejemplo.com',
        subject: 'Promoción especial',
        date: '2024-07-01T12:00:00Z',
        isRead: false,
        category: 'promotions',
        attachmentSizeMb: 2.5,
        suggestions: [
          {
            action: 'archive',
            classification: 'promotions_old',
            confidence_score: 0.91
          }
        ]
      }
    ]
  });
});

// 1) Mockeamos el módulo del controlador ANTES de importar las rutas
jest.unstable_mockModule('../src/controllers/suggestionController.js', () => ({
  getSuggestedEmails: mockGetSuggestedEmails
}));

// 2) Importamos las rutas ya con el controlador mockeado
const suggestionRoutesModule = await import('../src/routes/suggestionRoutes.js');
const suggestionRoutes = suggestionRoutesModule.default;

describe('GET /api/v1/suggestions (contrato Fastify)', () => {
  let app;
  const jwtSecret = 'test-secret';
  const sessionToken = jwt.sign({ email: 'user@example.com' }, jwtSecret, { expiresIn: 3600 });

  beforeAll(async () => {
    app = Fastify({ logger: false });
    process.env.INTERNAL_JWT_SECRET = jwtSecret;
    await app.register(cookie);

    // Registramos solo la ruta de sugerencias, sin plugin de DB ni nada extra
    await app.register(suggestionRoutes, { prefix: 'api/v1' });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 401 si no se envía cookie de sesión', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/suggestions'
    });

    expect(res.statusCode).toBe(401);

    const body = JSON.parse(res.body);
    expect(body).toEqual({ error: 'Missing or invalid auth token' });
  });

  it('responde 200 y devuelve emails con sugerencias cuando el token es válido', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/suggestions',
      headers: {
        cookie: `session_token=${sessionToken}`
      }
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.body);

    // Validamos contrato mínimo
    expect(Array.isArray(body.emails)).toBe(true);
    expect(body.emails.length).toBe(1);

    const email = body.emails[0];
    expect(email).toMatchObject({
      id: 'abc123',
      from: 'notificaciones@ejemplo.com',
      subject: 'Promoción especial',
      category: 'promotions'
    });

      expect(Array.isArray(email.suggestions)).toBe(true);
      expect(email.suggestions.length).toBe(1);

    const suggestion = email.suggestions[0];
    expect(suggestion).toMatchObject({
        action: 'archive',
        classification: 'promotions_old'
    });
      expect(typeof suggestion.confidence_score).toBe('number');

    // Verificamos que Fastify realmente haya llamado al controlador mockeado
    expect(mockGetSuggestedEmails).toHaveBeenCalledTimes(1);
  });
});
