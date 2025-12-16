import type { FastifyRequest, FastifyReply } from 'fastify';
import { serverConfig } from '../config.js';
import { getProjectByApiKey } from '../services/project-service.js';

declare module 'fastify' {
  interface FastifyRequest {
    projectId?: string;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.code(401).send({
      error: 'Missing authorization header',
      code: 'UNAUTHORIZED',
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Invalid authorization header format. Expected: Bearer <api_key>',
      code: 'INVALID_AUTH_FORMAT',
    });
  }

  const apiKey = authHeader.slice(7); // Remove 'Bearer ' prefix

  if (!apiKey.startsWith(serverConfig.apiKeyPrefix)) {
    return reply.code(401).send({
      error: `Invalid API key format. Expected prefix: ${serverConfig.apiKeyPrefix}`,
      code: 'INVALID_API_KEY_FORMAT',
    });
  }

  // Verify API key exists in database
  const project = await getProjectByApiKey(apiKey);

  if (!project) {
    return reply.code(401).send({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
    });
  }

  // Attach project ID to request for use in routes
  request.projectId = project.id;
}
