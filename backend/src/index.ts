import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './shared/lib/prisma';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const getUserFromToken = (req: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as any;
  } catch { return null; }
};

// ============ HEALTH ============
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ============ AUTH ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, plan: 'free' } });
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
    res.status(201).json({ success: true, data: { token, user: { id: user.id, name, email, plan: 'free' } } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email, plan: user.plan } } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/auth/me', async (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const user = await prisma.user.findUnique({ where: { id: d.userId }, select: { id: true, name: true, email: true, plan: true, avatar: true } });
    if (user) return res.json({ success: true, data: user });
  } catch (e: any) { return res.status(500).json({ success: false, error: e.message }); }
  res.status(404).json({ success: false, error: 'User not found' });
});

app.put('/api/auth/me', async (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    await prisma.user.update({ where: { id: d.userId }, data: { name: req.body.name, email: req.body.email } });
    res.json({ success: true, data: { message: 'Profile updated' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/auth/change-password', async (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const user = await prisma.user.findUnique({ where: { id: d.userId } });
    if (!user || !await bcrypt.compare(req.body.currentPassword, user.password)) return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await prisma.user.update({ where: { id: d.userId }, data: { password: hashedPassword } });
    res.json({ success: true, data: { message: 'Password changed' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/auth/avatar', async (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    await prisma.user.update({ where: { id: d.userId }, data: { avatar: req.body.avatar || '' } });
    res.json({ success: true, data: { message: 'Avatar updated' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ CONTACTS (Database) ============
app.get('/api/contacts', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.contact.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/contacts', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const data = await prisma.contact.create({ data: { name: req.body.name, phoneNumber: req.body.phoneNumber, email: req.body.email || '', tags: req.body.tags || [], userId: d.userId } });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/contacts/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.contact.updateMany({ where: { id: req.params.id, userId: d.userId }, data: req.body }); res.json({ success: true, data: { message: 'Updated' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/contacts/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.contact.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ CAMPAIGNS/BROADCASTS (Database) ============
app.get('/api/campaigns', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.broadcast.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/campaigns', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const data = await prisma.broadcast.create({ data: { name: req.body.name, message: req.body.message, recipients: req.body.recipients || [], status: req.body.scheduledAt ? 'scheduled' : 'draft', scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null, userId: d.userId } });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/campaigns/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.broadcast.updateMany({ where: { id: req.params.id, userId: d.userId }, data: req.body }); res.json({ success: true, data: { message: 'Updated' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/campaigns/:id/send', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.broadcast.updateMany({ where: { id: req.params.id, userId: d.userId }, data: { status: 'sent', sentAt: new Date() } }); res.json({ success: true, data: { message: 'Sent' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.broadcast.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ BROADCASTS (same as campaigns) ============
app.get('/api/broadcasts', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.broadcast.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ TEMPLATES (Database) ============
app.get('/api/templates', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.template.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/templates', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.template.create({ data: { name: req.body.name, content: req.body.content, userId: d.userId } }); res.status(201).json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/templates/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.template.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ DEVICES (Database) ============
app.get('/api/devices', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.device.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/devices/connect', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.device.create({ data: { name: req.body.name, phoneNumber: req.body.phoneNumber, status: 'connected', userId: d.userId } }); res.status(201).json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/devices/:id/disconnect', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.device.updateMany({ where: { id: req.params.id, userId: d.userId }, data: { status: 'disconnected', lastSeen: new Date() } }); res.json({ success: true, data: { message: 'Disconnected' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/devices/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.device.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ CHATBOT RULES (Database) ============
app.get('/api/chatbot/rules', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.chatbotRule.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/chatbot/rules', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.chatbotRule.create({ data: { keyword: req.body.keyword, reply: req.body.reply, matchType: req.body.matchType || 'contains', active: true, userId: d.userId } }); res.status(201).json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/chatbot/rules/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.chatbotRule.updateMany({ where: { id: req.params.id, userId: d.userId }, data: req.body }); res.json({ success: true, data: { message: 'Updated' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/chatbot/rules/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.chatbotRule.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ BLOG (Database) ============
app.get('/api/blog', async (req, res) => {
  try { const data = await prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.json({ success: true, data: [] }); }
});

app.get('/api/blog/:slug', async (req, res) => {
  try { const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } }); if (!post) return res.status(404).json({ success: false, error: 'Not found' }); res.json({ success: true, data: post }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ MEDIA (Database) ============
app.get('/api/media', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.media.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/media/upload', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.media.create({ data: { name: req.body.name, type: req.body.type, size: req.body.size, url: req.body.url, userId: d.userId } }); res.status(201).json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/media/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.media.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ TEAM (Database) ============
app.get('/api/team', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.teamMember.findMany({ where: { userId: d.userId } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/team', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.teamMember.create({ data: { email: req.body.email, role: req.body.role || 'member', userId: d.userId } }); res.status(201).json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/team/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.teamMember.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ WEBHOOKS (Database) ============
app.get('/api/webhooks', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.webhook.findMany({ where: { userId: d.userId } }); return res.json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/webhooks', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.webhook.create({ data: { url: req.body.url, events: req.body.events || [], userId: d.userId } }); res.status(201).json({ success: true, data }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/webhooks/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.webhook.deleteMany({ where: { id: req.params.id, userId: d.userId } }); res.json({ success: true, data: { message: 'Deleted' } }); }
  catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ MISC ============
app.get('/api/chats', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/logs', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/subscription', (req, res) => res.json({ success: true, data: { planId: 'free', status: 'active', plan: { name: 'Free', price: 0 } } }));
app.get('/api/usage', (req, res) => res.json({ success: true, data: { messagesSent: 0, messagesLimit: 100 } }));
app.get('/api/analytics/dashboard', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const [contacts, devices, campaigns] = await Promise.all([
      prisma.contact.count({ where: { userId: d.userId } }),
      prisma.device.count({ where: { userId: d.userId } }),
      prisma.broadcast.count({ where: { userId: d.userId } }),
    ]);
    res.json({ success: true, data: { totalMessages: 0, activeContacts: contacts, connectedDevices: devices, campaigns: campaigns, deliveryRate: '0%' } });
  } catch (e: any) { res.json({ success: true, data: { totalMessages: 0, activeContacts: 0, connectedDevices: 0, deliveryRate: '0%' } }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
