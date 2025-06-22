import { google } from 'googleapis';

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
    console.log('TOKENS OBTENIDOS:', tokens);

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

    reply.type('text/html').send(`
      <h2>Autenticación exitosa</h2>
      <p>El token fue almacenado en la base de datos para <b>${email}</b>.</p>
      <p>Ya puedes usar la API de Gmail de forma segura.</p>
    `);
  } catch (err) {
    reply.log.error(err);
    reply.status(500).send('Error autenticando con Google: ' + err.message);
  }
}
