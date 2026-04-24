import { Server, Socket } from 'socket.io';
import { prisma } from '../../prisma/client';

export function setupMessageHandlers(io: Server, socket: Socket) {
  socket.on('send-message', async (data) => {
    try {
      const { conversationId, message, userId } = data;
      
      // Save message to database
      const savedMessage = await prisma.message.create({
        data: {
          body: message,
          fromMe: true,
          status: 'SENT',
          conversationId,
          senderId: userId,
        },
        include: {
          sender: true,
        },
      });
      
      // Emit to conversation room
      io.to(`conv-${conversationId}`).emit('new-message', savedMessage);
      
      // Update conversation last message
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: message,
          lastMessageAt: new Date(),
        },
      });
      
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });
  
  socket.on('mark-read', async (data) => {
    try {
      const { conversationId, userId } = data;
      
      await prisma.message.updateMany({
        where: {
          conversationId,
          fromMe: false,
          status: { not: 'READ' },
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });
      
      io.to(`conv-${conversationId}`).emit('messages-read', { conversationId, userId });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });
}