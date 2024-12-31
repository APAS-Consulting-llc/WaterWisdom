import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './use-user';

interface CollaborationMessage {
  type: 'join' | 'leave' | 'edit' | 'cursor' | 'selection';
  entryId: number;
  userId: number;
  username: string;
  data?: any;
}

interface CollaboratorInfo {
  userId: number;
  username: string;
  cursor?: { line: number; ch: number };
  selection?: { from: { line: number; ch: number }; to: { line: number; ch: number } };
}

export function useCollaboration(entryId: number) {
  const { user } = useUser();
  const [collaborators, setCollaborators] = useState<Map<number, CollaboratorInfo>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/collaboration`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Join the collaboration room
      ws.send(JSON.stringify({
        type: 'join',
        entryId,
        userId: user.id,
        username: user.username,
      }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onmessage = (event) => {
      try {
        const message: CollaborationMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user, entryId]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const handleMessage = useCallback((message: CollaborationMessage) => {
    switch (message.type) {
      case 'join':
        setCollaborators(prev => {
          const next = new Map(prev);
          next.set(message.userId, { userId: message.userId, username: message.username });
          return next;
        });
        break;

      case 'leave':
        setCollaborators(prev => {
          const next = new Map(prev);
          next.delete(message.userId);
          return next;
        });
        break;

      case 'cursor':
      case 'selection':
        setCollaborators(prev => {
          const next = new Map(prev);
          const collaborator = next.get(message.userId) || {
            userId: message.userId,
            username: message.username,
          };
          
          if (message.type === 'cursor') {
            collaborator.cursor = message.data;
          } else {
            collaborator.selection = message.data;
          }
          
          next.set(message.userId, collaborator);
          return next;
        });
        break;
    }
  }, []);

  const sendEdit = useCallback((data: any) => {
    if (!user || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: 'edit',
      entryId,
      userId: user.id,
      username: user.username,
      data,
    }));
  }, [user, entryId]);

  const updateCursor = useCallback((cursor: { line: number; ch: number }) => {
    if (!user || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: 'cursor',
      entryId,
      userId: user.id,
      username: user.username,
      data: cursor,
    }));
  }, [user, entryId]);

  const updateSelection = useCallback((selection: { from: { line: number; ch: number }; to: { line: number; ch: number } }) => {
    if (!user || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: 'selection',
      entryId,
      userId: user.id,
      username: user.username,
      data: selection,
    }));
  }, [user, entryId]);

  return {
    isConnected,
    collaborators,
    sendEdit,
    updateCursor,
    updateSelection,
  };
}
