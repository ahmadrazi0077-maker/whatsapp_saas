import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class MessageController {
  async getConversations(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      
      const conversations = await prisma.conversation.findMany({
        where: { 
          device: { workspaceId },
          status: 'ACTIVE'
        },
        include: {
          contact: true,
          device: true,
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
      
      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        contactName: conv.contact.name || conv.contact.phoneNumber,
        contactNumber: conv.contact.phoneNumber,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageAt,
        unreadCount: 0, // TODO: Calculate unread count
        isOnline: false,
      }));
      
      res.json(formattedConversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }
  
  async getMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'asc' },
      });
      
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }
  
  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId, message } = req.body;
      const userId = (req as any).userId;
      
      const savedMessage = await prisma.message.create({
        data: {
          conversationId,
          body: message,
          fromMe: true,
          status: 'SENT',
          messageType: 'TEXT',
          senderId: userId,
        },
      });
      
      // Update conversation last message
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: message,
          lastMessageAt: new Date(),
        },
      });
      
      res.json(savedMessage);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
  
  async markAsRead(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      
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
      
      res.json({ success: true });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
}
