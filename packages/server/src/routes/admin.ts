import type { FastifyInstance } from 'fastify';
import { query } from '../db/connection.js';
import { serverConfig } from '../config.js';

// Admin authentication middleware
async function adminAuth(request: any, reply: any) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token || token !== serverConfig.adminApiKey) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
}

// Generate a random API key
function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'rc_proj_';
  for (let i = 0; i < 16; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export async function adminRoutes(fastify: FastifyInstance) {
  // Create a new project and API key
  fastify.post('/api/admin/projects', {
    preHandler: adminAuth,
  }, async (request, reply) => {
    const body = request.body as { name: string; metadata?: Record<string, any> };

    if (!body.name) {
      reply.code(400).send({ error: 'Project name is required' });
      return;
    }

    const apiKey = generateApiKey();
    const metadata = body.metadata || {};

    try {
      const result = await query<{ id: string; name: string; created_at: string }>(
        'INSERT INTO projects (id, name, metadata) VALUES ($1, $2, $3) RETURNING id, name, created_at',
        [apiKey, body.name, JSON.stringify(metadata)]
      );

      const project = result.rows[0];

      reply.code(201).send({
        apiKey: project.id,
        projectId: project.id,
        name: project.name,
        createdAt: project.created_at,
        metadata,
      });
    } catch (error: any) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to create project' });
    }
  });

  // List all projects
  fastify.get('/api/admin/projects', {
    preHandler: adminAuth,
  }, async (request, reply) => {
    try {
      const result = await query<{ id: string; name: string; created_at: string; metadata: any }>(
        'SELECT id, name, created_at, metadata FROM projects ORDER BY created_at DESC'
      );

      reply.send({
        projects: result.rows.map(row => ({
          apiKey: row.id,
          projectId: row.id,
          name: row.name,
          createdAt: row.created_at,
          metadata: row.metadata,
        })),
      });
    } catch (error: any) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to list projects' });
    }
  });

  // Delete a project (and all its comments via CASCADE)
  fastify.delete('/api/admin/projects/:projectId', {
    preHandler: adminAuth,
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    try {
      const result = await query(
        'DELETE FROM projects WHERE id = $1',
        [projectId]
      );

      if (result.rowCount === 0) {
        reply.code(404).send({ error: 'Project not found' });
        return;
      }

      reply.send({ success: true, message: 'Project deleted' });
    } catch (error: any) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to delete project' });
    }
  });
}
