import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyJWT } from '../middleware/auth';

interface ConnectedUser {
  userId: string;
  workspaceId: string;
  socketId: string;
}

const connectedUsers = new Map<string, ConnectedUser>();

export function initializeSocket(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    try {
      const payload = await verifyJWT(token);
      socket.data.userId = payload.sub;
      socket.data.workspaceId = payload.workspace_id;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Store user connection
    connectedUsers.set(socket.data.userId, {
      userId: socket.data.userId,
      workspaceId: socket.data.workspaceId,
      socketId: socket.id,
    });
    
    // Join workspace room
    socket.join(`workspace:${socket.data.workspaceId}`);
    
    // Handle joining a conversation
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
      console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
    });
    
    // Handle leaving a conversation
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });
    
    // Handle typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('user-typing', {
        userId: socket.data.userId,
        isTyping,
      });
    });
    
    // Handle sending a message (real-time)
    socket.on('send-message', async ({ conversationId, message, messageId }) => {
      // Save to database (already saved via API)
      // Broadcast to conversation room
      io.to(`conv:${conversationId}`).emit('new-message', {
        id: messageId,
        conversationId,
        body: message,
        fromMe: false,
        createdAt: new Date().toISOString(),
      });
    });
    
    // Handle message read receipts
    socket.on('mark-read', async ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('messages-read', {
        conversationId,
        userId: socket.data.userId,
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedUsers.delete(socket.data.userId);
    });
  });
  
  return io;
}

// Function to notify about new broadcast
export function notifyBroadcastStart(workspaceId: string, campaignId: string) {
  const io = global.io;
  io.to(`workspace:${workspaceId}`).emit('broadcast-start', { campaignId });
}

// Function to notify about broadcast progress
export function notifyBroadcastProgress(workspaceId: string, campaignId: string, progress: number) {
  const io = global.io;
  io.to(`workspace:${workspaceId}`).emit('broadcast-progress', { campaignId, progress });
}
