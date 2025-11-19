import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mocks para googleapis
const mockSetCredentials = jest.fn();
const mockOAuth2Instance = { setCredentials: mockSetCredentials };
const mockOAuth2 = jest.fn(() => mockOAuth2Instance);

const mockGmailClient = { fake: true };
const mockGmail = jest.fn(() => mockGmailClient);

// Mock del módulo 'googleapis' completo
jest.unstable_mockModule('googleapis', () => ({
  google: {
    auth: { OAuth2: mockOAuth2 },
    gmail: mockGmail
  }
}));

// Importamos el módulo a probar DESPUÉS de definir el mock
const googleAuthServiceModule = await import('../src/services/googleAuthService.js');
const {
  createOAuth2Client,
  createGmailClientFromToken,
  getGmailClientForUser
} = googleAuthServiceModule;

describe('googleAuthService', () => {
  beforeEach(() => {
    mockSetCredentials.mockClear();
    mockOAuth2.mockClear();
    mockGmail.mockClear();
  });

  it('createOAuth2Client usa las variables de entorno para instanciar OAuth2', () => {
    process.env.GOOGLE_CLIENT_ID = 'dummy-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'dummy-secret';
    process.env.GOOGLE_REDIRECT_URI = 'https://dummy-redirect';

    const client = createOAuth2Client();

    expect(mockOAuth2).toHaveBeenCalledWith(
      'dummy-client-id',
      'dummy-secret',
      'https://dummy-redirect'
    );
    expect(client).toBe(mockOAuth2Instance);
  });

  it('createGmailClientFromToken configura credenciales y crea cliente Gmail', () => {
    const tokenRecord = {
      access_token: 'access-123',
      refresh_token: 'refresh-456',
      expiry_date: new Date('2025-01-01T00:00:00Z')
    };

    const gmailClient = createGmailClientFromToken(tokenRecord);

    // Verifica que setCredentials fue llamado con lo correcto
    expect(mockSetCredentials).toHaveBeenCalledWith({
      access_token: 'access-123',
      refresh_token: 'refresh-456',
      expiry_date: new Date('2025-01-01T00:00:00Z').getTime()
    });

    // Verifica que se llamó google.gmail
    expect(mockGmail).toHaveBeenCalledWith({
      version: 'v1',
      auth: mockOAuth2Instance
    });

    // Y que regresamos el cliente que crea google.gmail
    expect(gmailClient).toBe(mockGmailClient);
  });

  it('createGmailClientFromToken lanza error si falta tokenRecord', () => {
    expect(() => createGmailClientFromToken(null))
      .toThrow('tokenRecord es requerido para crear el cliente de Gmail');
  });

  it('getGmailClientForUser busca el token por email y regresa un cliente Gmail', async () => {
    const tokenRecord = {
      email: 'user@example.com',
      access_token: 'access-123',
      refresh_token: 'refresh-456',
      expiry_date: new Date('2025-01-01T00:00:00Z')
    };

    const findOneMock = jest.fn().mockResolvedValue(tokenRecord);
    const server = {
      models: {
        Token: { findOne: findOneMock }
      }
    };

    const gmailClient = await getGmailClientForUser(server, 'user@example.com');

    expect(findOneMock).toHaveBeenCalledWith({
      where: { email: 'user@example.com' }
    });

    // Reusa la lógica de createGmailClientFromToken (mismos mocks)
    expect(mockSetCredentials).toHaveBeenCalled();
    expect(mockGmail).toHaveBeenCalled();
    expect(gmailClient).toBe(mockGmailClient);
  });

  it('getGmailClientForUser lanza error si no hay token para ese usuario', async () => {
    const server = {
      models: {
        Token: {
          findOne: jest.fn().mockResolvedValue(null)
        }
      }
    };

    await expect(getGmailClientForUser(server, 'missing@example.com'))
      .rejects
      .toThrow('No hay token almacenado para el usuario missing@example.com');
  });
});

