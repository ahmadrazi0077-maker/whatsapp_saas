import { prisma } from '../../shared/lib/prisma';

export class ChatService {
  async getAllChats(userId: string) {
    return prisma.chat.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 50,
        },
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  }

  async sendMessage(chatId: string, userId: string, content: string, type: string = 'text') {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        sender: 'me',
        content,
        type,
        timestamp: new Date(),
      },
    });

    // Update chat's last message
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    return message;
  }

  async createChat(userId: string, data: { phoneNumber: string; name: string }) {
    return prisma.chat.create({
      data: {
        phoneNumber: data.phoneNumber,
        name: data.name,
        userId,
      },
    });
  }
}