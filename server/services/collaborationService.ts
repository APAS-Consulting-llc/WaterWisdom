import { WebSocketServer } from "ws";
import { Server } from "http";
import { db } from "@db";
import { knowledgeRevisions } from "@db/schema";
import type { User } from "@db/schema";

interface Client {
  userId: number;
  username: string;
  ws: WebSocket;
  entryId?: number;
}

interface CollaborationMessage {
  type: 'join' | 'leave' | 'edit' | 'cursor' | 'selection';
  entryId: number;
  userId: number;
  username: string;
  data?: any;
}

class CollaborationService {
  private clients: Map<WebSocket, Client> = new Map();
  private rooms: Map<number, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    const wss = new WebSocketServer({ 
      server,
      path: '/api/collaboration'
    });

    wss.on('connection', this.handleConnection.bind(this));
    console.log('Collaboration WebSocket server started');
  }

  private handleConnection(ws: WebSocket, req: any) {
    if (!req.session?.passport?.user) {
      ws.close(1008, 'Authentication required');
      return;
    }

    const userId = req.session.passport.user;
    const username = req.session.passport.username || 'Anonymous';

    this.clients.set(ws, { userId, username, ws });

    ws.on('message', async (data: string) => {
      try {
        const message: CollaborationMessage = JSON.parse(data);
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      const client = this.clients.get(ws);
      if (client?.entryId) {
        this.handleLeaveRoom(ws, client.entryId);
      }
      this.clients.delete(ws);
    });
  }

  private async handleMessage(ws: WebSocket, message: CollaborationMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case 'join':
        await this.handleJoinRoom(ws, message.entryId);
        break;

      case 'leave':
        await this.handleLeaveRoom(ws, message.entryId);
        break;

      case 'edit':
        await this.handleEdit(ws, message);
        break;

      case 'cursor':
      case 'selection':
        await this.broadcastToRoom(message.entryId, message, ws);
        break;
    }
  }

  private async handleJoinRoom(ws: WebSocket, entryId: number) {
    const client = this.clients.get(ws);
    if (!client) return;

    client.entryId = entryId;

    if (!this.rooms.has(entryId)) {
      this.rooms.set(entryId, new Set());
    }

    const room = this.rooms.get(entryId)!;
    room.add(ws);

    // Notify others in the room
    const joinMessage: CollaborationMessage = {
      type: 'join',
      entryId,
      userId: client.userId,
      username: client.username,
    };

    await this.broadcastToRoom(entryId, joinMessage, ws);
  }

  private async handleLeaveRoom(ws: WebSocket, entryId: number) {
    const client = this.clients.get(ws);
    if (!client) return;

    const room = this.rooms.get(entryId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(entryId);
      }
    }

    // Notify others in the room
    const leaveMessage: CollaborationMessage = {
      type: 'leave',
      entryId,
      userId: client.userId,
      username: client.username,
    };

    await this.broadcastToRoom(entryId, leaveMessage, ws);
  }

  private async handleEdit(ws: WebSocket, message: CollaborationMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    try {
      // Save the revision to the database
      await db.insert(knowledgeRevisions).values({
        entryId: message.entryId,
        authorId: client.userId,
        title: message.data.title,
        content: message.data.content,
        category: message.data.category,
        tags: message.data.tags,
        revisionNote: message.data.revisionNote || 'Collaborative edit',
      });

      // Broadcast the changes to all clients in the room
      await this.broadcastToRoom(message.entryId, message, ws);
    } catch (error) {
      console.error('Error handling edit:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to save changes' }));
    }
  }

  private async broadcastToRoom(entryId: number, message: CollaborationMessage, exclude?: WebSocket) {
    const room = this.rooms.get(entryId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    for (const client of Array.from(room)) {
      if (client !== exclude && client.readyState === 1) { // WebSocket.OPEN = 1
        client.send(messageStr);
      }
    }
  }
}

export default CollaborationService;