import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { WhatsAppClient } from '../services/whatsapp/WhatsAppClient';

const clients = new Map<string, WhatsAppClient>();

export class WhatsAppController {
  async connect(req: Request, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      
      // Create device record
      const device = await prisma.device.create({
        data: {
          name: `Device ${Date.now()}`,
          workspaceId: workspaceId!,
          status: 'CONNECTING',
        },
      });
      
      // Initialize WhatsApp client
      const client = new WhatsAppClient(device.id, workspaceId!);
      clients.set(device.id, client);
      
      client.on('qr', (qrCode) => {
        // Update device with QR code
        prisma.device.update({
          where: { id: device.id },
          data: { qrCode, status: 'LOADING' },
        });
      });
      
      client.on('ready', async () => {
        await prisma.device.update({
          where: { id: device.id },
          data: { status: 'CONNECTED', lastConnected: new Date() },
        });
      });
      
      await client.initialize();
      
      res.json({ deviceId: device.id, status: 'CONNECTING' });
    } catch (error) {
      console.error('Connect error:', error);
      res.status(500).json({ error: 'Failed to connect device' });
    }
  }
  
  async getDevices(req: Request, res: Response) {
    try {
      const devices = await prisma.device.findMany({
        where: { workspaceId: req.workspaceId },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json(devices);
    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({ error: 'Failed to get devices' });
    }
  }
  
  async getQR(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const device = await prisma.device.findUnique({
        where: { id: deviceId, workspaceId: req.workspaceId },
      });
      
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      
      res.json({ qrCode: device.qrCode });
    } catch (error) {
      console.error('Get QR error:', error);
      res.status(500).json({ error: 'Failed to get QR code' });
    }
  }
  
  async disconnect(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const client = clients.get(deviceId);
      if (client) {
        await client.logout();
        clients.delete(deviceId);
      }
      
      await prisma.device.update({
        where: { id: deviceId, workspaceId: req.workspaceId },
        data: { status: 'DISCONNECTED', lastDisconnected: new Date() },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Disconnect error:', error);
      res.status(500).json({ error: 'Failed to disconnect device' });
    }
  }
  
  async sendMessage(req: Request, res: Response) {
    try {
      const { deviceId, to, message } = req.body;
      
      const client = clients.get(deviceId);
      if (!client) {
        return res.status(404).json({ error: 'Device not connected' });
      }
      
      const result = await client.sendMessage(to, message);
      
      // Save message to database
      const savedMessage = await prisma.message.create({
        data: {
          messageId: result.messageId,
          body: message,
          fromMe: true,
          status: 'SENT',
          deviceId,
          workspaceId: req.workspaceId!,
          conversationId: await this.getOrCreateConversation(to, deviceId),
        },
      });
      
      res.json(savedMessage);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
  
  private async getOrCreateConversation(phoneNumber: string, deviceId: string): Promise<string> {
    const contact = await prisma.contact.upsert({
      where: { phoneNumber },
      update: {},
      create: { phoneNumber, workspaceId: req.workspaceId! },
    });
    
    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id, deviceId },
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          deviceId,
          status: 'ACTIVE',
        },
      });
    }
    
    return conversation.id;
  }
}