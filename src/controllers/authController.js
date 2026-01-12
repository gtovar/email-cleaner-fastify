import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function initiateGoogleAuth(request, reply) {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'openid',
    'email'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
  reply.redirect(url);
}

export async function googleAuthCallback(request, reply) {
  const { code } = request.query;
  if (!code) return reply.status(400).send('No code provided');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    request.log.info('Google OAuth tokens received');

    let email = null;
    if (tokens.id_token) {
      try {
        const jwt = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString());
        email = jwt.email;
      } catch (e) {
        reply.log.error('Error decodificando id_token:', e);
      }
    }

    if (!email) {
      const fetch = (await import('node-fetch')).default;
      const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const userinfo = await resp.json();
      email = userinfo.email;
    }

    if (!email) return reply.status(500).send('No se pudo obtener el email del usuario.');

    // Accede al modelo Token vía Fastify
    const Token = request.server.models.Token;
    await Token.upsert({
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date) : null
    });

    const jwtSecret = process.env.INTERNAL_JWT_SECRET;
    if (!jwtSecret) {
      request.log.error('INTERNAL_JWT_SECRET is not configured');
      return reply.status(500).send('Server auth configuration error.');
    }

    const expiresInSeconds = Number(process.env.SESSION_JWT_TTL_SECONDS) || 3600;
    const sessionToken = jwt.sign({ email }, jwtSecret, { expiresIn: expiresInSeconds });

    const isProduction = process.env.NODE_ENV === 'production';
    reply.setCookie('session_token', sessionToken, {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      path: '/',
      maxAge: expiresInSeconds
    });

    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    const redirectUrl = new URL('/auth/callback', frontendOrigin);
    redirectUrl.searchParams.set('status', 'success');
    return reply.redirect(redirectUrl.toString());
  } catch (err) {
    reply.log.error(err);
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    const redirectUrl = new URL('/auth/callback', frontendOrigin);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    return reply.redirect(redirectUrl.toString());
  }
}
