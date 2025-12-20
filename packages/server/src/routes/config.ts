import type { FastifyInstance } from 'fastify';
import { serverConfig } from '../config.js';

export async function configRoutes(fastify: FastifyInstance) {
  // GET /api/config - Public endpoint to get client configuration
  // No auth required - publishable key is safe to expose
  fastify.get('/api/config', async (request, reply) => {
    return {
      clerkPublishableKey: serverConfig.clerkPublishableKey,
    };
  });
}
