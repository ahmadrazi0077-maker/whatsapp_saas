import { Server, Socket } from 'socket.io';

export const typingHandler = (io: Server, socket: Socket) => {
  socket.on('typing:start', (chatId: string) => {
    socket.to(`chat:${chatId}`).emit('typing:start', {
      chatId,
      userId: socket.data.userId,
    });
  });

  socket.on('typing:stop', (chatId: string) => {
    socket.to(`chat:${chatId}`).emit('typing:stop', {
      chatId,
      userId: socket.data.userId,
    });
  });
};