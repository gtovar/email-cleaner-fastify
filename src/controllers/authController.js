import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const WEB_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'openid',
  'email'
];

const MOBILE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'openid',
  'email'
];

const createWebClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

const createMobileClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_MOBILE_CLIENT_ID,
    process.env.GOOGLE_MOBILE_CLIENT_SECRET,
    process.env.GOOGLE_MOBILE_REDIRECT_URI
  );

const issueSessionToken = (email) => {
  const jwtSecret = process.env.INTERNAL_JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('INTERNAL_JWT_SECRET is not configured');
  }
  const expiresInSeconds = Number(process.env.SESSION_JWT_TTL_SECONDS) || 3600;
  const token = jwt.sign({ email }, jwtSecret, { expiresIn: expiresInSeconds });
  return { token, expiresInSeconds };
};

const resolveUserEmail = async (tokens, request) => {
  let email = null;
  if (tokens.id_token) {
    try {
      const payload = JSON.parse(
        Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
      );
      email = payload.email;
    } catch (error) {
      request.log.error('Error decoding id_token:', error);
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

  return email;
};

const persistTokens = async (TokenModel, email, tokens) => {
  const payload = {
    email,
    access_token: tokens.access_token,
    expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date) : null
  };
  if (tokens.refresh_token) {
    payload.refresh_token = tokens.refresh_token;
  }
  await TokenModel.upsert(payload);
};

export async function initiateGoogleAuth(request, reply) {
  const oauth2Client = createWebClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: WEB_SCOPES,
  });
  reply.redirect(url);
}

export async function googleAuthCallback(request, reply) {
  const { code } = request.query;
  if (!code) return reply.status(400).send('No code provided');

  try {
    const oauth2Client = createWebClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    request.log.info('Google OAuth tokens received');

    const email = await resolveUserEmail(tokens, request);

    if (!email) return reply.status(500).send('No se pudo obtener el email del usuario.');

    const Token = request.server.models.Token;
    await persistTokens(Token, email, tokens);

    const { token: sessionToken, expiresInSeconds } = issueSessionToken(email);

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

export async function googleAuthMobileExchange(request, reply) {
  const { code, code_verifier, redirect_uri } = request.body || {};
  if (!code || !code_verifier) {
    return reply.status(400).send('Missing code or code_verifier');
  }

  const expectedRedirect = process.env.GOOGLE_MOBILE_REDIRECT_URI;
  if (!expectedRedirect || redirect_uri !== expectedRedirect) {
    return reply.status(400).send('Invalid redirect_uri');
  }

  try {
    const oauth2Client = createMobileClient();
    const { tokens } = await oauth2Client.getToken({
      code,
      codeVerifier: code_verifier,
      redirect_uri: expectedRedirect
    });
    oauth2Client.setCredentials(tokens);

    const email = await resolveUserEmail(tokens, request);
    if (!email) return reply.status(500).send('No se pudo obtener el email del usuario.');

    const Token = request.server.models.Token;
    await persistTokens(Token, email, tokens);

    const { token: sessionToken, expiresInSeconds } = issueSessionToken(email);

    return reply.send({
      session_token: sessionToken,
      expires_in: expiresInSeconds,
      email
    });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send('oauth_exchange_failed');
  }
}
