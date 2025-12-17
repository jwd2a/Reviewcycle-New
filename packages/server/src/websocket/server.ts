import type { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import { roomManager } from './rooms.js';
import { getProjectByApiKey } from '../services/project-service.js';
import type { AuthMessage, WebSocketMessage } from 'reviewcycle-shared';

export async function setupWebSocket(fastify: FastifyInstance) {
  // Register WebSocket plugin
  await fastify.register(websocket);

  // WebSocket route
  fastify.get('/ws', { websocket: true }, (socket, request) => {
    console.log('WebSocket client connected');

    let projectId: string | null = null;
    let authenticated = false;

    // Set up ping/pong heartbeat
    const heartbeatInterval = setInterval(() => {
      if (socket.readyState === socket.OPEN) {
        socket.ping();
      }
    }, 30000); // 30 seconds

    socket.on('pong', () => {
      console.log('Received pong from client');
    });

    socket.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        // Handle authentication
        if (message.type === 'auth') {
          const authMessage = message as unknown as AuthMessage;
          const apiKey = authMessage.apiKey;

          if (!apiKey || !apiKey.startsWith('rc_proj_')) {
            socket.send(JSON.stringify({
              type: 'auth_error',
              payload: { message: 'Invalid API key format' },
            }));
            socket.close();
            return;
          }

          // Verify API key
          const project = await getProjectByApiKey(apiKey);

          if (!project) {
            socket.send(JSON.stringify({
              type: 'auth_error',
              payload: { message: 'Invalid API key' },
            }));
            socket.close();
            return;
          }

          // Authentication successful
          projectId = project.id;
          authenticated = true;

          // Join project room
          roomManager.joinRoom(projectId, socket);

          // Send success message
          socket.send(JSON.stringify({
            type: 'auth_success',
            payload: { projectId },
          }));

          console.log(`WebSocket authenticated for project: ${projectId}`);
        } else if (!authenticated) {
          socket.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Not authenticated. Send auth message first.' },
          }));
        }
      } catch (error: any) {
        console.error('WebSocket message error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' },
        }));
      }
    });

    socket.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(heartbeatInterval);

      if (projectId) {
        roomManager.leaveRoom(socket);
      }
    });

    socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized at /ws');
}

// Export room manager for broadcasting
export { roomManager };
