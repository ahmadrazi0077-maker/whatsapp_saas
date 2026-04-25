import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(`conv-${conversationId}`);
  });
  
  socket.on('send-message', async (data) => {
    io.to(`conv-${data.conversationId}`).emit('new-message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, workspaceName } = req.body;
    
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
        password: await bcrypt.hash(password, 10),
        name,
        workspaceId: workspace.id,
      },
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, workspaceId: workspace.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user.id, email, name, workspaceId: workspace.id } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, workspaceId: user.workspaceId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, workspaceId: user.workspaceId } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// WhatsApp routes
app.get('/api/whatsapp/devices', async (req, res) => {
  try {
    const devices = await prisma.device.findMany();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.post('/api/whatsapp/connect', async (req, res) => {
  try {
    const device = await prisma.device.create({
      data: {
        name: `Device ${Date.now()}`,
        status: 'CONNECTING',
        workspaceId: req.body.workspaceId || 'default',
      },
    });
    res.json({ deviceId: device.id, status: 'CONNECTING' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect device' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🗄️ Database connected`);
});
