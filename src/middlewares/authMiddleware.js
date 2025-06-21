// src/middlewares/authMiddleware.js (ES Module)
export default async function (request, reply) {
  const authHeader = request.headers['authorization'] || request.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Falta token o formato inválido' });
    return;
  }
  // Solo para pruebas: extrae el access_token del header
  const token = authHeader.replace('Bearer ', '').trim();
  request.user = {
    googleAccessToken: token
  };
}
