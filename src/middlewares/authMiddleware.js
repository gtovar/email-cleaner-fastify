// src/middlewares/authMiddleware.js (ES Module)
import jwt from 'jsonwebtoken';

export default async function (request, reply) {
  const authHeader = request.headers['authorization'] || request.headers['Authorization'];
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null;
  const cookieToken = request.cookies?.session_token;
  const token = bearerToken || cookieToken;

  if (!token) {
    reply.code(401).send({ error: 'Missing or invalid auth token' });
    return;
  }

  const jwtSecret = process.env.INTERNAL_JWT_SECRET;
  if (!jwtSecret) {
    reply.code(500).send({ error: 'Server auth configuration error' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    request.user = { email: payload.email, id: payload.email };
  } catch (err) {
    request.log.warn({ err }, 'Invalid auth token');
    reply.code(401).send({ error: 'Invalid or expired auth token' });
  }
}
