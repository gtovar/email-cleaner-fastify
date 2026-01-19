import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { encryptToken } from '../utils/tokenCrypto.js';

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

const resolveMobileOAuthConfig = (redirectUri) => {
  const iosRedirect = process.env.GOOGLE_MOBILE_REDIRECT_URI_IOS;
  const androidRedirect = process.env.GOOGLE_MOBILE_REDIRECT_URI_ANDROID;
  const legacyRedirect = process.env.GOOGLE_MOBILE_REDIRECT_URI;

  if (iosRedirect && redirectUri === iosRedirect) {
    return {
      clientId: process.env.GOOGLE_MOBILE_CLIENT_ID_IOS,
      clientSecret: process.env.GOOGLE_MOBILE_CLIENT_SECRET_IOS
    };
  }

  if (androidRedirect && redirectUri === androidRedirect) {
    return {
      clientId: process.env.GOOGLE_MOBILE_CLIENT_ID_ANDROID,
      clientSecret: process.env.GOOGLE_MOBILE_CLIENT_SECRET_ANDROID
    };
  }

  if (legacyRedirect && redirectUri === legacyRedirect) {
    return {
      clientId: process.env.GOOGLE_MOBILE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_MOBILE_CLIENT_SECRET
    };
  }

  return null;
};

const createMobileClient = (clientId, clientSecret, redirectUri) =>
  new google.auth.OAuth2(clientId, clientSecret, redirectUri);

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
    access_token: encryptToken(tokens.access_token),
    expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date) : null
  };
  if (tokens.refresh_token) {
    payload.refresh_token = encryptToken(tokens.refresh_token);
  }
  await TokenModel.upsert(payload);
};

export async function initiateGoogleAuth(request, reply) {
  const oauth2Client = createWebClient();
  const state = crypto.randomBytes(16).toString('hex');
  const isProduction = process.env.NODE_ENV === 'production';
  reply.setCookie('oauth_state', state, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
    maxAge: 10 * 60 // 10 minutes
  });
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: WEB_SCOPES,
    state,
  });
  reply.redirect(url);
}

export async function googleAuthCallback(request, reply) {
  const { code, state } = request.query;
  if (!code) return reply.status(400).send('No code provided');
  const storedState = request.cookies?.oauth_state;
  if (!state || !storedState || state !== storedState) {
    return reply.status(400).send('Invalid OAuth state');
  }

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
    reply.clearCookie('oauth_state', { path: '/' });

    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    const redirectUrl = new URL('/auth/callback', frontendOrigin);
    redirectUrl.searchParams.set('status', 'success');
    return reply.redirect(redirectUrl.toString());
  } catch (err) {
    reply.log.error(err);
    reply.clearCookie('oauth_state', { path: '/' });
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

  const oauthConfig = resolveMobileOAuthConfig(redirect_uri);
  if (!oauthConfig || !oauthConfig.clientId) {
    return reply.status(400).send('Invalid redirect_uri');
  }

  try {
    const oauth2Client = createMobileClient(
      oauthConfig.clientId,
      oauthConfig.clientSecret,
      redirect_uri
    );
    const { tokens } = await oauth2Client.getToken({
      code,
      codeVerifier: code_verifier,
      redirect_uri
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

export async function getAuthMe(request, reply) {
  const email = request.user?.email || null;
  return reply.send({ authenticated: true, email });
}

export async function logout(request, reply) {
  const isProduction = process.env.NODE_ENV === 'production';
  reply.clearCookie('session_token', {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  });
  return reply.send({ success: true });
}
