import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { EventEmitter } from 'events';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { processAutoReply } from './autoReply';

interface DeviceSession {
  client: Client;
  deviceId: string;
  userId: string;
  phoneNumber: string;
  status: 'connecting' | 'connected' | 'disconnected';
  qrCode: string | null;
}

class WhatsAppManager extends EventEmitter {
  private sessions: Map<string, DeviceSession> = new Map();

  async createSession(deviceId: string, userId: string, phoneNumber: string): Promise<string | null> {
    // Check if session already exists
    if (this.sessions.has(deviceId)) {
      logger.warn(`Session already exists for device ${deviceId}`);
      return this.sessions.get(deviceId)?.qrCode || null;
    }

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: deviceId }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    const session: DeviceSession = {
      client,
      deviceId,
      userId,
      phoneNumber,
      status: 'connecting',
      qrCode: null,
    };

    this.sessions.set(deviceId, session);

    // Return a promise that resolves with QR code
    return new Promise((resolve) => {
      client.on('qr', async (qr: string) => {
        logger.info(`QR code received for device ${deviceId}`);
        session.qrCode = qr;
        
        // Update device status in database
        await prisma.device.update({
          where: { id: deviceId },
          data: { status: 'connecting' },
        });

        resolve(qr);
      });

      client.on('ready', async () => {
        logger.info(`Device ${deviceId} is ready!`);
        session.status = 'connected';
        session.qrCode = null;

        // Update device status in database
        await prisma.device.update({
          where: { id: deviceId },
          data: { status: 'connected', battery: 100, lastSeen: new Date() },
        });

        this.emit('device:ready', { deviceId, userId, phoneNumber });
      });

      client.on('message', async (message: Message) => {
        await this.handleIncomingMessage(deviceId, userId, message);
      });

      client.on('disconnected', async (reason: string) => {
        logger.warn(`Device ${deviceId} disconnected: ${reason}`);
        session.status = 'disconnected';
        session.qrCode = null;

        await prisma.device.update({
          where: { id: deviceId },
          data: { status: 'disconnected', lastSeen: new Date() },
        });

        this.emit('device:disconnected', { deviceId, userId, reason });
        
        // Clean up session
        this.sessions.delete(deviceId);
      });

      client.initialize().catch(async (error) => {
        logger.error(`Failed to initialize device ${deviceId}:`, error);
        await prisma.device.update({
          where: { id: deviceId },
          data: { status: 'disconnected' },
        });
        this.sessions.delete(deviceId);
        resolve(null);
      });
    });
  }

  private async handleIncomingMessage(deviceId: string, userId: string, message: Message) {
    try {
      const from = message.from;
      const body = message.body;
      const timestamp = message.timestamp;

      logger.info(`Incoming message from ${from}: ${body}`);

      // Find or create chat
      let chat = await prisma.chat.findFirst({
        where: {
          userId,
          phoneNumber: from,
        },
      });

      if (!chat) {
        // Try to get contact name
        let contactName = from;
        try {
          const contact = await message.getContact();
          contactName = contact.pushname || contact.name || from;
        } catch (e) {
          // Use phone number as name
        }

        chat = await prisma.chat.create({
          data: {
            phoneNumber: from,
            name: contactName,
            userId,
            lastMessage: body,
            lastMessageAt: new Date(timestamp * 1000),
          },
        });
      } else {
        await prisma.chat.update({
          where: { id: chat.id },
          data: {
            lastMessage: body,
            lastMessageAt: new Date(timestamp * 1000),
          },
        });
      }

      // Save message to database
      const savedMessage = await prisma.message.create({
        data: {
          chatId: chat.id,
          sender: 'contact',
          content: body,
          type: message.hasMedia ? 'image' : 'text',
          status: 'delivered',
          timestamp: new Date(timestamp * 1000),
        },
      });

      // Check for auto-reply rules
      await processAutoReply(userId, from, body, this, deviceId);

      // Emit event for Socket.IO
      this.emit('message:received', {
        userId,
        deviceId,
        chat,
        message: savedMessage,
      });

    } catch (error) {
      logger.error('Error handling incoming message:', error);
    }
  }

  async sendMessage(deviceId: string, to: string, content: string): Promise<any> {
    const session = this.sessions.get(deviceId);
    if (!session || session.status !== 'connected') {
      throw new Error('Device not connected');
    }

    try {
      const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
      const sentMessage = await session.client.sendMessage(formattedNumber, content);
      
      logger.info(`Message sent from ${deviceId} to ${to}: ${content}`);
      
      return sentMessage;
    } catch (error) {
      logger.error(`Failed to send message from ${deviceId}:`, error);
      throw error;
    }
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    const session = this.sessions.get(deviceId);
    if (session) {
      try {
        await session.client.destroy();
      } catch (error) {
        logger.error(`Error destroying session for ${deviceId}:`, error);
      }
      this.sessions.delete(deviceId);
    }

    await prisma.device.update({
      where: { id: deviceId },
      data: { status: 'disconnected', battery: null, lastSeen: new Date() },
    });
  }

  getDeviceStatus(deviceId: string): string | null {
    return this.sessions.get(deviceId)?.status || null;
  }

  getActiveSessions(): number {
    let count = 0;
    this.sessions.forEach((session) => {
      if (session.status === 'connected') count++;
    });
    return count;
  }
}

// Singleton instance
export const whatsappManager = new WhatsAppManager();