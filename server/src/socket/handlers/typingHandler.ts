import { Server, Socket } from 'socket.io';

export function setupTypingHandlers(io: Server, socket: Socket) {
  socket.on('typing', (data) => {
    const { conversationId, isTyping, userId } = data;
    socket.to(`conv-${conversationId}`).emit('typing-indicator', {
      conversationId,
      isTyping,
      userId,
      timestamp: new Date(),
    });
  });
}