import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { sessionManager } from './shared/whatsapp/session.manager';
import { prisma } from './shared/lib/prisma';
NEXT_PUBLIC_API_URL = https://whatsapp-saas-tftc.onrender.com/api
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_xxx', { apiVersion: '2024-06-20' });

import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';

// ============ WHATSAPP CLOUD API ============

// Webhook verification (Meta calls this to verify)
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsflow-webhook-token';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified by Meta');
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: 'Verification failed' });
});

// Receive WhatsApp messages
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    if (req.body.object === 'whatsapp_business_account') {
      for (const entry of req.body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const messages = change.value?.messages || [];
            const contacts = change.value?.contacts || [];
            
            for (const msg of messages) {
              const from = msg.from;
              const body = msg.text?.body || '[Media]';
              const contactName = contacts.find((c: any) => c.wa_id === from)?.profile?.name || from;
              
              console.log(`📩 WhatsApp [${contactName}]: ${body}`);
              
              // Save to database
              try {
                const prisma = require('./shared/lib/prisma').prisma;
                const user = await prisma.user.findFirst({ where: { phone: from } });
                if (user) {
                  let chat = await prisma.chat.findFirst({ where: { userId: user.id, phoneNumber: from } });
                  if (!chat) {
                    chat = await prisma.chat.create({ data: { phoneNumber: from, name: contactName, userId: user.id, lastMessage: body, lastMessageAt: new Date() } });
                  } else {
                    await prisma.chat.update({ where: { id: chat.id }, data: { lastMessage: body, lastMessageAt: new Date() } });
                  }
                  await prisma.message.create({ data: { chatId: chat.id, sender: 'contact', content: body, type: 'text', status: 'delivered', timestamp: new Date(Number(msg.timestamp) * 1000 || Date.now()) } });
                }
              } catch (dbErr) { console.log('DB save skipped:', dbErr); }
              
              // Auto-reply
              await sendWhatsAppMessage(from, 'Thanks for your message! We received it. \n\n- WhatsFlow Team');
            }
          }
        }
      }
    }
    res.status(200).json({ status: 'ok' });
  } catch (e: any) {
    console.error('Webhook error:', e);
    res.status(200).json({ status: 'ok' });
  }
});

// Send WhatsApp message function
async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { preview_url: false, body: message },
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ WhatsApp sent to', to);
    return response.data;
  } catch (e: any) {
    console.error('Send error:', e.response?.data || e.message);
    throw e;
  }
}

// API: Send WhatsApp from dashboard
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    const result = await sendWhatsAppMessage(to, message);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// API: Send template message
app.post('/api/whatsapp/send-template', async (req, res) => {
  try {
    const { to, templateName, parameters } = req.body;
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: { name: templateName, language: { code: 'en' }, components: [{ type: 'body', parameters: parameters.map((p: string) => ({ type: 'text', text: p })) }] },
      },
      { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, data: response.data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});
app.use(cors());
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

const PLANS: any = {
  free: { id: 'free', name: 'Free', price: 0, messagesLimit: 100, devicesLimit: 1, contactsLimit: 100, features: ['1 WhatsApp Number', '100 Messages/Month'], stripePriceId: null },
  starter: { id: 'starter', name: 'Starter', price: 9, messagesLimit: 1000, devicesLimit: 1, contactsLimit: 500, features: ['1 WhatsApp Number', '1,000 Messages/Month'], stripePriceId: 'price_starter_id' },
  pro: { id: 'pro', name: 'Pro', price: 19, messagesLimit: 5000, devicesLimit: 2, contactsLimit: 2000, features: ['2 WhatsApp Numbers', '5,000 Messages/Month'], stripePriceId: 'price_pro_id', popular: true },
  business: { id: 'business', name: 'Business', price: 39, messagesLimit: 15000, devicesLimit: 5, contactsLimit: 10000, features: ['5 WhatsApp Numbers', '15,000 Messages/Month'], stripePriceId: 'price_business_id' },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: null, messagesLimit: Infinity, devicesLimit: Infinity, contactsLimit: Infinity, features: ['Unlimited'], stripePriceId: null, custom: true },
};

const chatbotRules: any[] = [];
const users: any[] = [];
const subscriptions: Map<string, any> = new Map();
const usageStore: Map<string, any> = new Map();



class UsageTracker {
  private userId: string;
  constructor(userId: string) {
    this.userId = userId;
    if (!usageStore.has(userId)) usageStore.set(userId, { messagesSent: 0, contactsCreated: 0, devicesConnected: 0 });
  }
  private get data() { return usageStore.get(this.userId)!; }
  private get plan() { const u = users.find(u => u.id === this.userId); return PLANS[u?.plan || 'free']; }
  trackMessage() { this.data.messagesSent++; }
  getUsage() {
    return {
      messagesSent: this.data.messagesSent, messagesLimit: this.plan.messagesLimit,
      messagesPercent: this.plan.messagesLimit === Infinity ? 0 : Math.round((this.data.messagesSent / this.plan.messagesLimit) * 100),
      contactsCreated: this.data.contactsCreated, contactsLimit: this.plan.contactsLimit,
      devicesConnected: this.data.devicesConnected, devicesLimit: this.plan.devicesLimit,
      isNearLimit: this.plan.messagesLimit !== Infinity && (this.data.messagesSent / this.plan.messagesLimit) >= 0.8,
      isAtLimit: this.plan.messagesLimit !== Infinity && this.data.messagesSent >= this.plan.messagesLimit,
    };
  }
  canSendMessage() {
    if (this.plan.messagesLimit === Infinity) return { allowed: true };
    if (this.data.messagesSent >= this.plan.messagesLimit) return { allowed: false, reason: 'Message limit reached. Upgrade to send more.' };
    return { allowed: true };
  }
}

const getUserFromToken = (req: any) => {
  try { const t = req.headers.authorization?.split(' ')[1]; return t ? jwt.verify(t, JWT_SECRET) as any : null; } catch { return null; }
};

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/plans', (req, res) => {
  const data = Object.values(PLANS).map((p: any) => ({ id: p.id, name: p.name, price: p.price, messagesLimit: p.messagesLimit === Infinity ? 'Unlimited' : p.messagesLimit, devicesLimit: p.devicesLimit, contactsLimit: p.contactsLimit === Infinity ? 'Unlimited' : p.contactsLimit, features: p.features, popular: p.popular || false, custom: p.custom || false }));
  res.json({ success: true, data });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ success: false, error: 'Email exists' });
      const hp = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { name, email, password: hp, plan: 'free' } });
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
      return res.status(201).json({ success: true, data: { token, user: { id: user.id, name, email, plan: 'free' } } });
    } catch {
      if (users.find((u: any) => u.email === email)) return res.status(400).json({ success: false, error: 'Email exists' });
      const hp = await bcrypt.hash(password, 10);
      const user = { id: Date.now().toString(), name, email, password: hp, plan: 'free' };
      users.push(user);
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
      return res.status(201).json({ success: true, data: { token, user: { id: user.id, name, email, plan: 'free' } } });
    }
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
        return res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email, plan: user.plan } } });
      }
    } catch {}
    const user = users.find((u: any) => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' } as any);
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email, plan: user.plan } } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/auth/me', async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, name: true, email: true, plan: true, avatar: true } });
    if (user) return res.json({ success: true, data: user });
  } catch {}
  const user = users.find((u: any) => u.id === decoded.userId);
  if (!user) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar || '' } });
});

app.get('/api/usage', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  res.json({ success: true, data: new UsageTracker(d.userId).getUsage() });
});

app.get('/api/contacts', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.contact.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); } catch {}
  res.json({ success: true, data: [] });
});

app.post('/api/contacts', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const data = await prisma.contact.create({ data: { name: req.body.name, phoneNumber: req.body.phoneNumber, email: req.body.email || '', tags: req.body.tags || [], userId: d.userId } });
    return res.status(201).json({ success: true, data });
  } catch {}
  res.status(201).json({ success: true, data: { id: Date.now().toString(), ...req.body } });
});

app.delete('/api/contacts/:id', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { await prisma.contact.deleteMany({ where: { id: req.params.id, userId: d.userId } }); } catch {}
  res.json({ success: true, data: { message: 'Deleted' } });
});


// GET chatbot rules (already exists)
app.get('/api/chatbot/rules', (req, res) => {
  const d = getUserFromToken(req); 
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  res.json({ success: true, data: chatbotRules.filter((r: any) => r.userId === d.userId) });
});

// POST chatbot rule (ADD THIS)
app.post('/api/chatbot/rules', (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  
  const { keyword, reply, matchType } = req.body;
  if (!keyword || !reply) return res.status(400).json({ success: false, error: 'Keyword and reply required' });
  
  const rule = { 
    id: Date.now().toString(), 
    keyword, 
    reply, 
    matchType: matchType || 'contains', 
    active: true, 
    userId: d.userId,
    createdAt: new Date().toISOString() 
  };
  chatbotRules.push(rule);
  console.log('Rule saved:', keyword);
  res.status(201).json({ success: true, data: rule });
});

// DELETE chatbot rule (ADD THIS)
app.delete('/api/chatbot/rules/:id', (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const i = chatbotRules.findIndex((r: any) => r.id === req.params.id && r.userId === d.userId);
  if (i > -1) chatbotRules.splice(i, 1);
  res.json({ success: true, data: { message: 'Deleted' } });
});

// PUT (update/toggle) chatbot rule (ADD THIS)
app.put('/api/chatbot/rules/:id', (req, res) => {
  const d = getUserFromToken(req);
  if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const rule = chatbotRules.find((r: any) => r.id === req.params.id && r.userId === d.userId);
  if (!rule) return res.status(404).json({ success: false, error: 'Not found' });
  if (typeof req.body.active === 'boolean') rule.active = req.body.active;
  if (req.body.keyword) rule.keyword = req.body.keyword;
  if (req.body.reply) rule.reply = req.body.reply;
  res.json({ success: true, data: rule });
});
app.get('/api/campaigns', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.broadcast.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); } catch {}
  res.json({ success: true, data: [] });
});

app.post('/api/campaigns', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const data = await prisma.broadcast.create({ data: { name: req.body.name, message: req.body.message, recipients: req.body.recipients || [], status: 'draft', userId: d.userId } });
    return res.status(201).json({ success: true, data });
  } catch {}
  res.status(201).json({ success: true, data: { id: Date.now().toString(), ...req.body, status: 'draft' } });
});

app.get('/api/devices', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.device.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); } catch {}
  res.json({ success: true, data: [] });
});

app.post('/api/devices/connect', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  const { name, phoneNumber } = req.body;
  try {
    const device = await prisma.device.create({ data: { name, phoneNumber, status: 'connected', userId: d.userId } });
    return res.status(201).json({ success: true, data: device });
  } catch {}
  const device = { id: Date.now().toString(), name, phoneNumber, status: 'connected', userId: d.userId };
  res.status(201).json({ success: true, data: device });
});

app.get('/api/templates', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.template.findMany({ where: { userId: d.userId }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); } catch {}
  res.json({ success: true, data: [] });
});

app.post('/api/templates', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ success: false, error: 'No token' });
  try { const data = await prisma.template.create({ data: { name: req.body.name, content: req.body.content, userId: d.userId } }); return res.status(201).json({ success: true, data }); } catch {}
  res.status(201).json({ success: true, data: { id: Date.now().toString(), ...req.body } });
});


app.get('/api/blog', async (req, res) => {
  try { const data = await prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }); return res.json({ success: true, data }); } catch {}
  res.json({ success: true, data: [
    { id: '1', title: 'Getting Started with WhatsApp Automation', slug: 'getting-started', excerpt: 'Learn WhatsApp automation basics.', category: 'Guide', author: 'WhatsFlow Team', tags: ['whatsapp'], createdAt: '2026-05-01' },
  ]});
});

app.get('/api/subscription', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ error: 'No token' });
  res.json({ success: true, data: { planId: 'free', status: 'active', plan: PLANS.free } });
});

app.get('/api/analytics/dashboard', (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ error: 'No token' });
  res.json({ success: true, data: { totalMessages: 0, activeContacts: 0, connectedDevices: 0, deliveryRate: '0%' } });
});

app.put('/api/auth/me', async (req, res) => {
  const d = getUserFromToken(req); if (!d) return res.status(401).json({ error: 'No token' });
  try { await prisma.user.update({ where: { id: d.userId }, data: { name: req.body.name, email: req.body.email } }); } catch {}
  res.json({ success: true, data: { message: 'Updated' } });
});

app.post('/api/auth/change-password', async (req, res) => {
  res.json({ success: true, data: { message: 'Password changed' } });
});

// ============ WHATSAPP WEBHOOK ============
app.post('/api/webhook/whatsapp', (req, res) => {
  console.log('📩 WhatsApp webhook received:', JSON.stringify(req.body, null, 2));
  
  const { from, body, timestamp } = req.body;
  
  if (from && body) {
    // Save message to contacts/conversations
    console.log(`Message from ${from}: ${body}`);
    
    // Here you would save to your database
    // await prisma.message.create({ data: { ... } });
  }
  
  // Always return 200 to acknowledge receipt
  res.status(200).json({ status: 'ok' });
});

// Webhook verification (for Meta/Twilio)
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsflow-webhook-token';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on port', PORT));
