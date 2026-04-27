import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { email, password, name, workspaceName } = validatedData;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create workspace
      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceName || `${name}'s Workspace`,
          slug: workspaceName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `${Date.now()}`,
        },
      });
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          workspaceId: workspace.id,
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          workspaceId: true,
          createdAt: true,
        },
      });
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, workspaceId: workspace.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      
      res.json({ token, user });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
  
  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;
      
      const user = await prisma.user.findUnique({ 
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          workspaceId: true,
          createdAt: true,
        },
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      
      const token = jwt.sign(
        { userId: user.id, workspaceId: user.workspaceId },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
  
  async getMe(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          workspaceId: true,
          avatar: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
  
  async updateProfile(req: Request, res: Response) {
    try {
      const { name, avatar } = req.body;
      
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { name, avatar },
        select: {
          id: true,
         
