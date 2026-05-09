import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../shared/lib/prisma';


export const router = Router();

// Auth Routes
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Chats Routes
router.get('/chats', async (req: Request, res: Response) => {
  return res.json({ success: true, data: [] });
});

// Contacts Routes
router.get('/contacts', async (req: Request, res: Response) => {
  return res.json({ success: true, data: [] });
});

// Devices Routes
router.get('/devices', async (req: Request, res: Response) => {
  return res.json({ success: true, data: [] });
});

// Broadcasts Routes
router.get('/broadcasts', async (req: Request, res: Response) => {
  return res.json({ success: true, data: [] });
});

// Analytics Routes
router.get('/analytics/dashboard', async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      totalMessages: 0,
      activeContacts: 0,
      connectedDevices: 0,
      deliveryRate: '0%',
    },
  });
});