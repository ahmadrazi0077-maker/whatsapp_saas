import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { prisma } from '../../lib/prisma';

export class WhatsAppClient {
  private client: Client;
  private deviceId: string;
  
  constructor(deviceId: string, sessionData?: any) {
    this.deviceId = deviceId;
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: deviceId,
        dataPath: `./sessions/${deviceId}`,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      const qrCodeDataUrl = await QRCode.toDataURL(qr);
      await prisma.device.update({
        where: { id: this.deviceId },
        data: { qrCode: qrCodeDataUrl, status: 'LOADING' },
      });
    });
    
    this.client.on('ready', async () => {
      const info = this.client.info;
      await prisma.device.update({
        where: { id: this.deviceId },
        data: {
          status: 'CONNECTED',
          phoneNumber: info.wid.user,
          lastConnected: new Date(),
          qrCode: null,
        },
      });
    });
    
    this.client.on('message', async (message) => {
      // Handle incoming messages
      const contact = await message.getContact();
      await this.saveIncomingMessage(message, contact);
    });
    
    this.client.on('disconnected', async (reason) => {
      await prisma.device.update({
        where: { id: this.deviceId },
        data: { status: 'DISCONNECTED', lastDisconnected: new Date() },
      });
    });
  }
  
  private async saveIncomingMessage(message: any, contact: any) {
    // Find or create contact
    let dbContact = await prisma.contact.findFirst({
      where: { phoneNumber: contact.number },
    });
    
    if (!dbContact) {
      const device = await prisma.device.findUnique({ where: { id: this.deviceId } });
      dbContact = await prisma.contact.create({
        data: {
          phoneNumber: contact.number,
          name: contact.pushname || contact.name,
          workspaceId: device!.workspaceId,
        },
      });
    }
    
    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { contactId: dbContact.id, deviceId: this.deviceId },
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: dbContact.id,
          deviceId: this.deviceId,
        },
      });
    }
    
    // Save message
    await prisma.message.create({
      data: {
        messageId: message.id.id,
        body: message.body,
        fromMe: false,
        conversationId: conversation.id,
        contactId: dbContact.id,
        deviceId: this.deviceId,
      },
    });
    
    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: message.body,
        lastMessageAt: new Date(),
      },
    });
  }
  
  async initialize() {
    await this.client.initialize();
  }
  
  async sendMessage(to: string, message: string) {
    const chat = await this.client.getChatById(`${to}@c.us`);
    const msg = await chat.sendMessage(message);
    return { messageId: msg.id.id, success: true };
  }
  
  async logout() {
    await this.client.logout();
  }
}
