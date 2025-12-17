import Fastify from 'fastify';
import { serverConfig } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';
import { configureCors } from './middleware/cors.js';
import { commentRoutes } from './routes/comments.js';
import { setupWebSocket } from './websocket/server.js';

const fastify = Fastify({
  logger: {
    level: serverConfig.nodeEnv === 'production' ? 'info' : 'debug',
  },
});

// Register CORS
await configureCors(fastify);

// Register error handler
fastify.setErrorHandler(errorHandler);

// Register WebSocket
await setupWebSocket(fastify);

// Register routes
fastify.register(commentRoutes);

// Health check endpoint (public)
fastify.get('/health', async (request, reply) => {
  try {
    // Check database connection
    const { query } = await import('./db/connection.js');
    await query('SELECT 1');

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: serverConfig.nodeEnv,
      database: 'connected',
    };
  } catch (error: any) {
    reply.code(503);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: serverConfig.nodeEnv,
      database: 'disconnected',
      error: error.message,
    };
  }
});

// Test protected endpoint
fastify.get('/api/test', {
  preHandler: authMiddleware,
}, async (request, reply) => {
  return {
    message: 'Authentication successful',
    projectId: request.projectId,
  };
});

// Start server
async function start() {
  try {
    // Run migrations on startup
    const { runMigrations } = await import('./db/migrations.js');
    await runMigrations();

    await fastify.listen({
      port: serverConfig.port,
      host: serverConfig.host,
    });

    fastify.log.info(
      `Server listening on http://${serverConfig.host}:${serverConfig.port}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
