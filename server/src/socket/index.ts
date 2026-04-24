import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { setupMessageHandlers } from './handlers/messageHandler';
import { setupTypingHandlers } from './handlers/typingHandler';
import { authenticateSocket } from '../middleware/auth.middleware';

export function initializeSocket(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });
  
  // Authentication middleware
  io.use(authenticateSocket);
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join workspace room
    const workspaceId = socket.data.workspaceId;
    if (workspaceId) {
      socket.join(`workspace-${workspaceId}`);
    }
    
    // Join conversation room
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conv-${conversationId}`);
    });
    
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conv-${conversationId}`);
    });
    
    // Setup handlers
    setupMessageHandlers(io, socket);
    setupTypingHandlers(io, socket);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
}