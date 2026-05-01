import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { supabase } from './lib/supabase';
import { redis } from './lib/redis';
import './queues/broadcast.queue';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints (simplified for now)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, workspaceName } = req.body;
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({ name: workspaceName || `${name}'s Workspace` })
      .select()
      .single();
    
    if (workspaceError) throw workspaceError;
    
    // Create user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email,
        name,
        workspace_id: workspace.id,
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    res.json({
      token: authData.session?.access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspace_id,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, workspace_id')
      .eq('email', email)
      .single();
    
    res.json({
      token: data.session?.access_token,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        workspaceId: user?.workspace_id,
      },
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
  });
  
  socket.on('send-message', (data) => {
    io.to(`conv:${data.conversationId}`).emit('new-message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🗄️ Supabase connected`);
});

export { io };
