import type { WebSocket } from '@fastify/websocket';

interface RoomClient {
  ws: WebSocket;
  projectId: string;
}

class RoomManager {
  private rooms: Map<string, Set<RoomClient>> = new Map();

  getRoomName(projectId: string): string {
    return `project:${projectId}`;
  }

  joinRoom(projectId: string, ws: WebSocket): void {
    const roomName = this.getRoomName(projectId);

    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }

    const room = this.rooms.get(roomName)!;
    const client: RoomClient = { ws, projectId };
    room.add(client);

    console.log(`Client joined room: ${roomName} (${room.size} clients)`);
  }

  leaveRoom(ws: WebSocket): void {
    // Find and remove client from any room
    for (const [roomName, clients] of this.rooms.entries()) {
      for (const client of clients) {
        if (client.ws === ws) {
          clients.delete(client);
          console.log(`Client left room: ${roomName} (${clients.size} clients remaining)`);

          // Clean up empty rooms
          if (clients.size === 0) {
            this.rooms.delete(roomName);
            console.log(`Room deleted: ${roomName}`);
          }

          return;
        }
      }
    }
  }

  broadcast(projectId: string, message: any, excludeWs?: WebSocket): void {
    const roomName = this.getRoomName(projectId);
    const room = this.rooms.get(roomName);

    if (!room) {
      console.log(`No room found for project: ${projectId}`);
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const client of room) {
      if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    }

    console.log(`Broadcast to ${sentCount} clients in room: ${roomName}`);
  }

  getClientCount(projectId: string): number {
    const roomName = this.getRoomName(projectId);
    const room = this.rooms.get(roomName);
    return room ? room.size : 0;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}

export const roomManager = new RoomManager();
