import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { serverConfig } from '../config.js';
import { getProjectByApiKey } from '../services/project-service.js';
import { upsertUser } from '../services/user-service.js';

// Create Clerk client instance
const clerkClient = createClerkClient({
  secretKey: serverConfig.clerkSecretKey,
});

declare module 'fastify' {
  interface FastifyRequest {
    projectId?: string;
    userId?: string;
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
      error: 'Invalid authorization header format. Expected: Bearer <token>',
      code: 'INVALID_AUTH_FORMAT',
    });
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  // Check if it's an API key (for project auth) or Clerk token (for user auth)
  if (token.startsWith(serverConfig.apiKeyPrefix)) {
    // API key authentication (project-level)
    const project = await getProjectByApiKey(token);

    if (!project) {
      return reply.code(401).send({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY',
      });
    }

    request.projectId = project.id;
    // No userId for API key auth (backward compatibility)
  } else {
    // Clerk JWT authentication (user-level)
    try {
      // Verify Clerk session token
      const payload = await verifyToken(token, {
        secretKey: serverConfig.clerkSecretKey,
      });

      const clerkUserId = payload.sub;

      // Get user details from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      // Upsert user in our database
      const user = await upsertUser({
        id: clerkUserId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
        avatarUrl: clerkUser.imageUrl,
      });

      // Get projectId from custom header or use default
      const projectId = request.headers['x-project-id'] as string || serverConfig.defaultProjectId;

      if (!projectId) {
        return reply.code(400).send({
          error: 'Missing project ID. Include x-project-id header.',
          code: 'MISSING_PROJECT_ID',
        });
      }

      request.userId = user.id;
      request.projectId = projectId;
    } catch (error: any) {
      console.error('Clerk auth error:', error);
      return reply.code(401).send({
        error: 'Invalid or expired session token',
        code: 'INVALID_SESSION',
      });
    }
  }
}
