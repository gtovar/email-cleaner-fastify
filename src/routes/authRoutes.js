export default async function authRoutes(fastify, options) {
  const controller = await import('../controllers/authController.js');
  fastify.get('/auth/google', controller.initiateGoogleAuth);
  fastify.get('/auth/google/callback', controller.googleAuthCallback);
  fastify.post('/auth/google/mobile', controller.googleAuthMobileExchange);
}
