// src/services/googleAuthService.js
import { google } from 'googleapis';

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
export function createGmailClientFromToken(tokenRecord) {
  if (!tokenRecord) {
    throw new Error('tokenRecord es requerido para crear el cliente de Gmail');
  }

  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({
    access_token: tokenRecord.access_token,
    refresh_token: tokenRecord.refresh_token,
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

  return createGmailClientFromToken(tokenRecord);
}

