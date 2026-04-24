import { Client, LocalAuth, Message as WhatsAppMessage } from 'whatsapp-web.js';
import { EventEmitter } from 'events';
import QRCode from 'qrcode';
import { prisma } from '../../prisma/client';
import { MessageHandler } from './MessageHandler';
import { AutoReplyEngine } from '../automation/AutoReplyEngine';

export class WhatsAppClient extends EventEmitter {
  private client: Client;
  private deviceId: string;
  private workspaceId: string;
  private messageHandler: MessageHandler;
  private autoReplyEngine: AutoReplyEngine;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  constructor(deviceId: string, workspaceId: string) {
    super();
    this.deviceId = deviceId;
    this.workspaceId = workspaceId;
    this.messageHandler = new MessageHandler();
    this.autoReplyEngine = new AutoReplyEngine();
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: deviceId,
        dataPath: `./sessions/${workspaceId}/${deviceId}`,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
    
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // QR Code generation
    this.client.on('qr', async (qr) => {
      const qrCodeDataUrl = await QRCode.toDataURL(qr);
      
      await prisma.device.update({
        where: { id: this.deviceId },
        data: {
          qrCode: qrCodeDataUrl,
          status: 'LOADING',
        },
      });
      
      this.emit('qr', qrCodeDataUrl);
    });

    // Device ready
    this.client.on('ready', async () => {
      console.log(`Device ${this.deviceId} is ready`);
      
      await prisma.device.update({
        where: { id: this.deviceId },
        data: {
          status: 'CONNECTED',
          lastConnected: new Date(),
          qrCode: null,
        },
      });
      
      this.reconnectAttempts = 0;
      this.emit('ready');
      
      // Get device info
      const info = await this.client.info;
      await prisma.device.update({
        where: { id: this.deviceId },
        data: {
          phoneNumber: info.wid.user,
          platform: info.platform,
        },
      });
    });

    // Message handler
    this.client.on('message', async (message: WhatsAppMessage) => {
      await this.handleIncomingMessage(message);
    });

    // Disconnect handler
    this.client.on('disconnected', async (reason) => {
      console.log(`Device ${this.deviceId} disconnected: ${reason}`);
      
      await prisma.device.update({
        where: { id: this.deviceId },
        data: {
          status: 'DISCONNECTED',
          lastDisconnected: new Date(),
        },
      });
      
      this.emit('disconnected', reason);
      
      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.initialize(), 5000 * this.reconnectAttempts);
      }
    });

    // Authentication failure
    this.client.on('auth_failure', async (msg) => {
      console.log(`Device ${this.deviceId} auth failure: ${msg}`);
      await prisma.device.update({
        where: { id: this.deviceId },
        data: { status: 'ERROR' },
      });
      
      this.emit('auth_failure', msg);
    });
  }

  async initialize() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error(`Failed to initialize device ${this.deviceId}:`, error);
      throw error;
    }
  }

  private async handleIncomingMessage(message: WhatsAppMessage) {
    try {
      const contact = await message.getContact();
      const chat = await message.getChat();
      
      // Save message to database
      const savedMessage = await this.messageHandler.saveMessage({
        messageId: message.id.id,
        body: message.body,
        fromMe: false,
        sender: contact.pushname || contact.name || contact.number,
        senderNumber: contact.number,
        timestamp: new Date(message.timestamp * 1000),
        deviceId: this.deviceId,
        workspaceId: this.workspaceId,
        messageType: this.getMessageType(message),
        mediaUrl: message.hasMedia ? await this.handleMedia(message) : null,
      });
      
      // Check for auto-reply
      const autoReply = await this.autoReplyEngine.checkAndReply(
        message.body,
        this.deviceId,
        this.workspaceId
      );
      
      if (autoReply) {
        await this.sendMessage(chat.id._serialized, autoReply);
      }
      
      // Emit real-time event
      this.emit('new_message', savedMessage);
      
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  async sendMessage(to: string, text: string) {
    try {
      const chat = await this.client.getChatById(to);
      const message = await chat.sendMessage(text);
      
      return {
        success: true,
        messageId: message.id.id,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendMedia(to: string, mediaUrl: string, caption?: string) {
    try {
      const chat = await this.client.getChatById(to);
      const media = await this.downloadMedia(mediaUrl);
      const message = await chat.sendMessage(media, { caption });
      
      return {
        success: true,
        messageId: message.id.id,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error sending media:', error);
      throw error;
    }
  }

  async sendBulkMessages(contacts: string[], message: string) {
    const results = [];
    
    for (const contact of contacts) {
      try {
        const result = await this.sendMessage(contact, message);
        results.push({ contact, success: true, ...result });
      } catch (error) {
        results.push({ contact, success: false, error: error.message });
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  async logout() {
    await this.client.logout();
    await prisma.device.update({
      where: { id: this.deviceId },
      data: { status: 'DISCONNECTED', sessionData: null },
    });
  }

  async getStatus() {
    return this.client.info ? 'CONNECTED' : 'DISCONNECTED';
  }

  private getMessageType(message: WhatsAppMessage): string {
    if (message.hasMedia) {
      if (message.type === 'image') return 'IMAGE';
      if (message.type === 'video') return 'VIDEO';
      if (message.type === 'audio') return 'AUDIO';
      if (message.type === 'document') return 'DOCUMENT';
    }
    return 'TEXT';
  }

  private async handleMedia(message: WhatsAppMessage): Promise<string> {
    const media = await message.downloadMedia();
    // Upload to Supabase or local storage
    const mediaUrl = await this.uploadMedia(media);
    return mediaUrl;
  }

  private async downloadMedia(url: string): Promise<any> {
    // Implement media download logic
    return url;
  }

  private async uploadMedia(media: any): Promise<string> {
    // Implement media upload to Supabase
    return `https://storage.supabase.co/media/${Date.now()}_${media.filename}`;
  }
}