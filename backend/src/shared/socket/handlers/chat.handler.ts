import { Server, Socket } from 'socket.io';

export const chatHandler = (io: Server, socket: Socket) => {
  socket.on('chat:message', async (data: { chatId: string; message: string }) => {
    try {
      // Broadcast to all users in the chat room
      io.to(`chat:${data.chatId}`).emit('chat:message', {
        chatId: data.chatId,
        message: data.message,
        sender: socket.data.userId,
        timestamp: new Date(),
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('chat:join', (chatId: string) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on('chat:leave', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
  });
};