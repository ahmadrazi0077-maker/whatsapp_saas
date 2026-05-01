// server/src/controllers/whatsappController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Get all devices for the user
export const getDevices = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // Assumes your auth middleware attaches the user
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const devices = await prisma.device.findMany({
      where: { userId: userId },
      orderBy: { created_at: 'desc' }
    });

    return res.status(200).json(devices);
  } catch (error: any) {
    console.error("Error in getDevices:", error);
    return res.status(500).json({ error: "Failed to fetch devices", details: error.message });
  }
};

// 2. Connect (Add) a new device
export const connectDevice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Create a new device record in the database
    // Initially, the status is 'connecting' because the user hasn't scanned a QR code yet
    const newDevice = await prisma.device.create({
      data: {
        userId: userId,
        name: `Device ${Math.floor(Math.random() * 1000)}`, // Give it a temporary name
        status: 'connecting', 
        phone_number: '', // Will be updated once WhatsApp actually connects
      }
    });

    // TODO: In the future, you will trigger your WhatsApp library (like whatsapp-web.js)
    // here to generate a QR code and send it to the frontend via WebSockets.

    return res.status(201).json({ 
      message: "Device connection initiated", 
      device: newDevice 
    });

  } catch (error: any) {
    console.error("Error in connectDevice:", error);
    return res.status(500).json({ error: "Failed to connect device", details: error.message });
  }
};
