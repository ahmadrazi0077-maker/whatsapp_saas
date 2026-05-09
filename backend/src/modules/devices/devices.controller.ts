import { Response } from 'express';
import { prisma } from '../../shared/lib/prisma';
import { sessionManager } from '../../shared/whatsapp/session.manager';
import { logger } from '../../shared/lib/logger';

const getUserFromToken = (req: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'my-secret-key');
  } catch { return null; }
};

export class DevicesController {
  // GET all devices
  async getAll(req: any, res: Response) {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const devices = await prisma.device.findMany({ where: { userId: user.userId }, orderBy: { createdAt: 'desc' } });
    const data = devices.map(d => ({ ...d, realtimeStatus: sessionManager.getStatus(d.id) || d.status }));
    res.json({ success: true, data });
  }

  // POST connect device
  async connect(req: any, res: Response) {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    try {
      const { name, phoneNumber } = req.body;
      
      // Check device limit
      const deviceCount = await prisma.device.count({ where: { userId: user.userId } });
      if (deviceCount >= 5) {
        return res.status(400).json({ success: false, error: 'Device limit reached (max 5)' });
      }

      const device = await prisma.device.create({
        data: { name, phoneNumber, status: 'connecting', userId: user.userId },
      });

      // Start WhatsApp session
      const qrResult = await sessionManager.createSession(device.id, user.userId, phoneNumber);
      
      res.status(201).json({
        success: true,
        data: {
          ...device,
          qrCode: qrResult?.qrCode || null,
          qrDataUrl: qrResult?.qrDataUrl || null,
        },
      });
    } catch (e: any) {
      logger.error('Connect device error:', e);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET device by ID
  async getById(req: any, res: Response) {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const device = await prisma.device.findFirst({ where: { id: req.params.id, userId: user.userId } });
    if (!device) return res.status(404).json({ success: false, error: 'Not found' });
    const qrData = sessionManager.getQRCode(device.id);
    res.json({
      success: true,
      data: {
        ...device,
        qrCode: qrData?.qrCode || null,
        qrDataUrl: qrData?.qrDataUrl || null,
        realtimeStatus: sessionManager.getStatus(device.id) || device.status,
      },
    });
  }

  // GET QR code
  async getQR(req: any, res: Response) {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const qrData = sessionManager.getQRCode(req.params.id);
    if (!qrData) return res.status(404).json({ success: false, error: 'No QR code available' });
    res.json({ success: true, data: qrData });
  }

  // POST disconnect
  async disconnect(req: any, res: Response) {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await sessionManager.disconnectDevice(req.params.id);
    res.json({ success: true, data: { message: 'Disconnected' } });
  }

  // POST send message
  async sendMessage(req: any, res: Response) {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    try {
      await sessionManager.sendMessage(req.params.id, req.body.to, req.body.message);
      res.json({ success: true, data: { message: 'Sent' } });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}