import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const users: any[] = [];
const contacts: any[] = [];
const campaigns: any[] = [];
const templates: any[] = [];
const chatbotRules: any[] = [];
const devices: any[] = [];

const getUserFromToken = (req: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as any;
  } catch { return null; }
};

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (users.find((u: any) => u.email === email)) return res.status(400).json({ success: false, error: 'Email exists' });
  const hp = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), name, email, password: hp, plan: 'free', avatar: '' };
  users.push(user);
  const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
  res.status(201).json({ success: true, data: { token, user: { id: user.id, name, email, plan: 'free' } } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u: any) => u.email === email);
  if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
  res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email, plan: user.plan } } });
});

app.get('/api/auth/me', (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const user = users.find((u: any) => u.id === d.userId);
  if (!user) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar } });
});

// Contacts
app.get('/api/contacts', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  res.json({ success: true, data: contacts.filter((c: any) => c.userId === d.userId) });
});

app.post('/api/contacts', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const contact = { id: Date.now().toString(), ...req.body, userId: d.userId, createdAt: new Date().toISOString() };
  contacts.push(contact);
  res.status(201).json({ success: true, data: contact });
});

app.delete('/api/contacts/:id', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const i = contacts.findIndex((c: any) => c.id === req.params.id && c.userId === d.userId);
  if (i > -1) contacts.splice(i, 1);
  res.json({ success: true, data: { message: 'Deleted' } });
});

// Devices
app.get('/api/devices', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  res.json({ success: true, data: devices.filter((dev: any) => dev.userId === d.userId) });
});

app.post('/api/devices/connect', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const device = { id: Date.now().toString(), ...req.body, status: 'connected', userId: d.userId };
  devices.push(device);
  res.status(201).json({ success: true, data: device });
});

// Campaigns
app.get('/api/campaigns', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  res.json({ success: true, data: campaigns.filter((c: any) => c.userId === d.userId) });
});

app.post('/api/campaigns', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const campaign = { id: Date.now().toString(), ...req.body, status: 'draft', userId: d.userId };
  campaigns.push(campaign);
  res.status(201).json({ success: true, data: campaign });
});

// Templates
app.get('/api/templates', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  res.json({ success: true, data: templates.filter((t: any) => t.userId === d.userId) });
});

app.post('/api/templates', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const t = { id: Date.now().toString(), ...req.body, userId: d.userId };
  templates.push(t);
  res.status(201).json({ success: true, data: t });
});

// Chatbot
app.get('/api/chatbot/rules', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  res.json({ success: true, data: chatbotRules.filter((r: any) => r.userId === d.userId) });
});

app.post('/api/chatbot/rules', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const rule = { id: Date.now().toString(), ...req.body, active: true, userId: d.userId };
  chatbotRules.push(rule);
  res.status(201).json({ success: true, data: rule });
});

app.delete('/api/chatbot/rules/:id', (req, res) => {
  const i = chatbotRules.findIndex((r: any) => r.id === req.params.id);
  if (i > -1) chatbotRules.splice(i, 1);
  res.json({ success: true, data: { message: 'Deleted' } });
});

// Misc
app.get('/api/subscription', (req, res) => res.json({ success: true, data: { planId: 'free', plan: { name: 'Free', price: 0 } } }));
app.get('/api/usage', (req, res) => res.json({ success: true, data: { messagesSent: 0, messagesLimit: 100 } }));
app.get('/api/analytics/dashboard', (req, res) => res.json({ success: true, data: { totalMessages: 0, activeContacts: contacts.length, connectedDevices: devices.length, deliveryRate: '0%' } }));
app.get('/api/team', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/webhooks', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/logs', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/media', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/chats', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/blog', (req, res) => res.json({ success: true, data: [
  { id: '1', title: 'Getting Started', slug: 'getting-started', excerpt: 'Learn WhatsApp automation.', category: 'Guide', author: 'WhatsFlow', tags: ['guide'], createdAt: '2026-01-01' },
  { id: '2', title: 'Marketing Tips', slug: 'marketing-tips', excerpt: 'Top strategies.', category: 'Marketing', author: 'Sarah', tags: ['tips'], createdAt: '2026-01-02' },
] }));

export default app;
