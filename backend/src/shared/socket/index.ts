import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { authMiddleware } from './middleware/auth.middleware';
import { chatHandler } from './handlers/chat.handler';
import { typingHandler } from './handlers/typing.handler';
import { env } from '../config/env';
import { whatsappManager } from '../whatsapp/whatsapp.client';
import { sessionManager } from '../whatsapp/session.manager';

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(authMiddleware);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);

    // Join user's personal room
    socket.join(`user:${socket.data.userId}`);

    // Register handlers
    chatHandler(io, socket);
    typingHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.userId);
    });
  });

  return io;
};


// Inside initializeSocket function:

// Forward session manager events to Socket.IO
sessionManager.on('qr:received', (data) => {
  io.to(`user:${data.userId}`).emit('qr:received', {
    deviceId: data.deviceId,
    qr: data.qr,
  });
});

sessionManager.on('device:ready', (data) => {
  io.to(`user:${data.userId}`).emit('device:ready', data);
});

sessionManager.on('device:disconnected', (data) => {
  io.to(`user:${data.userId}`).emit('device:disconnected', data);
});

sessionManager.on('message:received', (data) => {
  io.to(`user:${data.userId}`).emit('message:received', data);
});

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
whatsappManager.on('message:received', (data) => {
  io.to(`user:${data.userId}`).emit('whatsapp:message', data);
});

whatsappManager.on('device:ready', (data) => {
  io.to(`user:${data.userId}`).emit('whatsapp:device:ready', data);
});

whatsappManager.on('device:disconnected', (data) => {
  io.to(`user:${data.userId}`).emit('whatsapp:device:disconnected', data);
});