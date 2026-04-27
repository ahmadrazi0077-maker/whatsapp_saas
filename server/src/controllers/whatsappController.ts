import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class WhatsAppController {
  async getDevices(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const devices = await prisma.device.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json(devices);
    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({ error: 'Failed to get devices' });
    }
  }
  
  async connectDevice(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      
      const device = await prisma.device.create({
        data: {
          name: `Device ${Date.now()}`,
          status: 'CONNECTING',
          workspaceId,
        },
      });
      
      // TODO: Implement actual WhatsApp Web connection
      // This would use whatsapp-web.js to generate QR code
      
      res.json({ 
        deviceId: device.id, 
        status: 'CONNECTING',
        message: 'Device connection initiated. Scan QR code to connect.'
      });
    } catch (error) {
      console.error('Connect device error:', error);
      res.status(500).json({ error: 'Failed to connect device' });
    }
  }
  
  async disconnectDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const workspaceId = (req as any).workspaceId;
      
      await prisma.device.updateMany({
        where: { id: deviceId, workspaceId },
        data: { status: 'DISCONNECTED' },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Disconnect device error:', error);
      res.status(500).json({ error: 'Failed to disconnect device' });
    }
  }
}
