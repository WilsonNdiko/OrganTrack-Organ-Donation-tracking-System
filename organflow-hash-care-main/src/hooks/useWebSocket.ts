import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (event: string, data: any) => void;
  connect: (hospitalId?: string, token?: string) => void;
  disconnect: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback((hospitalId?: string, token?: string) => {
    if (socketRef.current?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket server...');

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3002', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setSocket(newSocket);
      socketRef.current = newSocket;

      // Authenticate if credentials provided
      if (hospitalId && token) {
        console.log('🔐 Authenticating WebSocket...');
        newSocket.emit('authenticate', { hospitalId, token });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
      setSocket(null);
      socketRef.current = null;
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Authentication events
    newSocket.on('authenticated', (data) => {
      console.log('✅ WebSocket authenticated:', data.message);
    });

    newSocket.on('authentication_failed', (data) => {
      console.error('❌ WebSocket authentication failed:', data.error);
    });

    // System events
    newSocket.on('system_status', (data) => {
      console.log('📊 System status update:', data);
      setLastMessage({
        type: 'system_status',
        data,
        timestamp: data.timestamp
      });
    });

    // Organ events
    newSocket.on('organ_created', (data) => {
      console.log('🆕 Organ created notification:', data);
      setLastMessage({
        type: 'organ_created',
        data,
        timestamp: data.timestamp
      });
    });

    newSocket.on('organ_transferred', (data) => {
      console.log('🚚 Organ transferred notification:', data);
      setLastMessage({
        type: 'organ_transferred',
        data,
        timestamp: data.timestamp
      });
    });

    newSocket.on('organ_arrived', (data) => {
      console.log('🏥 Organ arrived notification:', data);
      setLastMessage({
        type: 'organ_arrived',
        data,
        timestamp: data.timestamp
      });
    });

    newSocket.on('organ_transplanted', (data) => {
      console.log('💉 Organ transplanted notification:', data);
      setLastMessage({
        type: 'organ_transplanted',
        data,
        timestamp: data.timestamp
      });
    });

    // Request events
    newSocket.on('request_updated', (data) => {
      console.log('📋 Request updated notification:', data);
      setLastMessage({
        type: 'request_updated',
        data,
        timestamp: data.timestamp
      });
    });

    // Health check
    newSocket.on('pong', (data) => {
      console.log('🏓 WebSocket pong received');
    });

  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting WebSocket...');
      socketRef.current.disconnect();
      setSocket(null);
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
};
