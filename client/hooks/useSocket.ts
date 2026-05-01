'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, [token]);

  const joinConversation = (conversationId: string) => {
    socket?.emit('join-conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socket?.emit('leave-conversation', conversationId);
  };

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    socket?.emit('typing', { conversationId, isTyping });
  };

  const onNewMessage = (callback: (message: any) => void) => {
    socket?.on('new-message', callback);
    return () => socket?.off('new-message', callback);
  };

  const onTyping = (callback: (data: any) => void) => {
    socket?.on('user-typing', callback);
    return () => socket?.off('user-typing', callback);
  };

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendTyping,
    onNewMessage,
    onTyping,
  };
}
