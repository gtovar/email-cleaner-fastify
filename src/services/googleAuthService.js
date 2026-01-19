// src/services/googleAuthService.js
import { google } from 'googleapis';
import { decryptToken } from '../utils/tokenCrypto.js';

/**
 * Crea un cliente OAuth2 de Google usando variables de entorno.
 * No hace ninguna llamada de red, solo prepara el objeto.
 */
export function createOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Recibe un registro de la tabla Token y devuelve un cliente Gmail listo para usarse.
 * NO toca la base de datos, solo usa el objeto tokenRecord.
 */
export function createGmailClientFromToken(tokenRecord, { onTokens } = {}) {
  if (!tokenRecord) {
    throw new Error('tokenRecord es requerido para crear el cliente de Gmail');
  }

  const oauth2Client = createOAuth2Client();

  if (typeof onTokens === 'function' && typeof oauth2Client.on === 'function') {
    oauth2Client.on('tokens', onTokens);
  }

  oauth2Client.setCredentials({
    access_token: decryptToken(tokenRecord.access_token),
    refresh_token: decryptToken(tokenRecord.refresh_token),
    // expiry_date en DB está como DATE; si existe, lo convertimos a timestamp en ms
    expiry_date: tokenRecord.expiry_date
      ? new Date(tokenRecord.expiry_date).getTime()
      : undefined
  });

  return google.gmail({
    version: 'v1',
    auth: oauth2Client
  });
}

/**
 * Helper de alto nivel: dado el email del usuario,
 * busca el token en la DB y regresa un cliente Gmail.
 *
 * - server: instancia de Fastify (para usar server.models.Token)
 * - email: correo del usuario autenticado
 */
export async function getGmailClientForUser(server, email) {
  if (!server || !server.models || !server.models.Token) {
    throw new Error('server.models.Token no está disponible');
  }

  if (!email) {
    throw new Error('email es requerido para cargar el token de Gmail');
  }

  const Token = server.models.Token;
  const tokenRecord = await Token.findOne({ where: { email } });

  if (!tokenRecord) {
    throw new Error(`No hay token almacenado para el usuario ${email}`);
  }

  const logger = server.log;

  const onTokens = async (tokens) => {
    if (!tokens || typeof tokens !== 'object') {
      return;
    }

    const updates = {};

    if (tokens.access_token) {
      updates.access_token = tokens.access_token;
    }

    if (tokens.refresh_token) {
      updates.refresh_token = tokens.refresh_token;
    }

    if (tokens.expiry_date) {
      updates.expiry_date = new Date(tokens.expiry_date);
    }

    if (!Object.keys(updates).length) {
      return;
    }

    try {
      if (typeof tokenRecord.update === 'function') {
        await tokenRecord.update(updates);
      } else if (typeof Token.update === 'function') {
        await Token.update(updates, { where: { email } });
      }
    } catch (err) {
      logger?.warn?.({ err, email }, 'Failed to persist refreshed Google tokens');
    }
  };

  return createGmailClientFromToken(tokenRecord, { onTokens });
}
