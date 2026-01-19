export default async function authRoutes(fastify, options) {
  const controller = await import('../controllers/authController.js');
  const authMiddleware = (await import('../middlewares/authMiddleware.js')).default;
  fastify.get('/auth/google', controller.initiateGoogleAuth);
  fastify.get('/auth/google/callback', controller.googleAuthCallback);
  fastify.post('/auth/google/mobile', controller.googleAuthMobileExchange);
  fastify.get('/api/v1/auth/me', { preHandler: [authMiddleware] }, controller.getAuthMe);
  fastify.post('/api/v1/auth/logout', { preHandler: [authMiddleware] }, controller.logout);
}
