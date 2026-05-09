import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { DevicesController } from './modules/devices/devices.controller';
import { sessionManager } from './shared/whatsapp/session.manager';

import { prisma } from './shared/lib/prisma';



const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';

const stripe = new Stripe('sk_test_51TTgqxLL1KA02vvS3YJxtUg4ucon44aYJSuCclGAybQ4TBHiTfjMjfPtX7GpC5OxzB5477tsz8iqSsbJp2Bbz1gp008NcrSDEr', { apiVersion: '2024-06-20' });

app.use(cors({ origin: '*', credentials: true }));
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());



// ============ PLANS CONFIG ============
const PLANS: any = {
  free: {
    id: 'free', name: 'Free', price: 0,
    messagesLimit: 100, devicesLimit: 1, contactsLimit: 100, autoReplyRules: 5,
    features: ['1 WhatsApp Number', '100 Messages/Month', '5 Auto Reply Rules', '100 Contacts'],
    stripePriceId: null,
  },
  starter: {
    id: 'starter', name: 'Starter', price: 9,
    messagesLimit: 1000, devicesLimit: 1, contactsLimit: 500, autoReplyRules: Infinity,
    features: ['1 WhatsApp Number', '1,000 Messages/Month', 'Unlimited Auto Replies', 'Contact Management', 'Basic Analytics', 'Email Support'],
    stripePriceId: 'price_starter_id',
  },
  pro: {
    id: 'pro', name: 'Pro', price: 19,
    messagesLimit: 5000, devicesLimit: 2, contactsLimit: 2000, autoReplyRules: Infinity,
    features: ['2 WhatsApp Numbers', '5,000 Messages/Month', 'Broadcast Messaging', 'Advanced Contact Tagging', 'Priority Support', 'Real-time Chat'],
    stripePriceId: 'price_pro_id', popular: true,
  },
  business: {
    id: 'business', name: 'Business', price: 39,
    messagesLimit: 15000, devicesLimit: 5, contactsLimit: 10000, autoReplyRules: Infinity,
    features: ['5 WhatsApp Numbers', '15,000 Messages/Month', 'Team Access', 'Advanced Analytics', 'Automation Logs', 'Faster Delivery'],
    stripePriceId: 'price_business_id',
  },
  enterprise: {
    id: 'enterprise', name: 'Enterprise', price: null,
    messagesLimit: Infinity, devicesLimit: Infinity, contactsLimit: Infinity, autoReplyRules: Infinity,
    features: ['Unlimited Numbers', 'Unlimited Messages', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee'],
    stripePriceId: null, custom: true,
  },
};

// ============ DATA STORES ============
const users: any[] = [];
const subscriptions: Map<string, any> = new Map();
const usageStore: Map<string, { messagesSent: number; messagesReceived: number; contactsCreated: number; devicesConnected: number; dailyUsage: any[] }> = new Map();

// ============ USAGE TRACKER ============
class UsageTracker {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    if (!usageStore.has(userId)) {
      usageStore.set(userId, {
        messagesSent: 0, messagesReceived: 0, contactsCreated: 0, devicesConnected: 0, dailyUsage: []
      });
    }
  }

  private get data() { return usageStore.get(this.userId)!; }
  private get plan() {
    const user = users.find(u => u.id === this.userId);
    const planId = user?.plan || 'free';
    return PLANS[planId] || PLANS.free;
  }

  trackMessage() {
    this.data.messagesSent++;
    this.trackDaily('messages');
  }

  trackContact() {
    this.data.contactsCreated++;
  }

  trackDevice() {
    this.data.devicesConnected++;
  }

  private trackDaily(type: string) {
    const today = new Date().toISOString().split('T')[0];
    let day = this.data.dailyUsage.find(d => d.date === today);
    if (!day) {
      day = { date: today, messages: 0, broadcasts: 0 };
      this.data.dailyUsage.push(day);
    }
    day.messages++;
  }

  getUsage() {
    return {
      messagesSent: this.data.messagesSent,
      messagesLimit: this.plan.messagesLimit,
      messagesPercent: this.plan.messagesLimit === Infinity ? 0 : Math.round((this.data.messagesSent / this.plan.messagesLimit) * 100),
      contactsCreated: this.data.contactsCreated,
      contactsLimit: this.plan.contactsLimit,
      contactsPercent: this.plan.contactsLimit === Infinity ? 0 : Math.round((this.data.contactsCreated / this.plan.contactsLimit) * 100),
      devicesConnected: this.data.devicesConnected,
      devicesLimit: this.plan.devicesLimit,
      devicesPercent: this.plan.devicesLimit === Infinity ? 0 : Math.round((this.data.devicesConnected / this.plan.devicesLimit) * 100),
      isNearLimit: this.isNearLimit(),
      isAtLimit: this.isAtLimit(),
      dailyUsage: this.data.dailyUsage.slice(-30),
    };
  }

  isNearLimit(): boolean {
    const pct = this.plan.messagesLimit === Infinity ? 0 : (this.data.messagesSent / this.plan.messagesLimit) * 100;
    return pct >= 80;
  }

  isAtLimit(): boolean {
    if (this.plan.messagesLimit === Infinity) return false;
    return this.data.messagesSent >= this.plan.messagesLimit;
  }

  canSendMessage(): { allowed: boolean; reason?: string } {
    if (this.plan.messagesLimit === Infinity) return { allowed: true };
    if (this.data.messagesSent >= this.plan.messagesLimit) {
      return { allowed: false, reason: `Message limit reached (${this.data.messagesSent}/${this.plan.messagesLimit}). Upgrade to send more.` };
    }
    return { allowed: true };
  }

  canAddContact(): { allowed: boolean; reason?: string } {
    if (this.plan.contactsLimit === Infinity) return { allowed: true };
    if (this.data.contactsCreated >= this.plan.contactsLimit) {
      return { allowed: false, reason: `Contact limit reached (${this.data.contactsCreated}/${this.plan.contactsLimit}). Upgrade to add more.` };
    }
    return { allowed: true };
  }

  canAddDevice(): { allowed: boolean; reason?: string } {
    if (this.plan.devicesLimit === Infinity) return { allowed: true };
    if (this.data.devicesConnected >= this.plan.devicesLimit) {
      return { allowed: false, reason: `Device limit reached (${this.data.devicesConnected}/${this.plan.devicesLimit}). Upgrade to connect more.` };
    }
    return { allowed: true };
  }

  resetMonthly() {
    this.data.messagesSent = 0;
    this.data.messagesReceived = 0;
  }
}

// ============ HELPERS ============
const getUserFromToken = (req: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as any;
  } catch { return null; }
};

const getTracker = (userId: string) => new UsageTracker(userId);



// ============ HEALTH ============
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ============ PLANS ============
app.get('/api/plans', (req, res) => {
  const data = Object.values(PLANS).map((p: any) => ({
    id: p.id, name: p.name, price: p.price,
    messagesLimit: p.messagesLimit === Infinity ? 'Unlimited' : p.messagesLimit.toLocaleString(),
    devicesLimit: p.devicesLimit === Infinity ? 'Unlimited' : p.devicesLimit,
    contactsLimit: p.contactsLimit === Infinity ? 'Unlimited' : p.contactsLimit.toLocaleString(),
    features: p.features, popular: p.popular || false, custom: p.custom || false,
  }));
  res.json({ success: true, data });
});

// ============ AUTH ============
// ============ REGISTER (Database) ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists in database
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Hash password and save to database
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plan: 'free',
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ LOGIN (Database) ============
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ GET CURRENT USER (Database) ============
app.get('/api/auth/me', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'No token' });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
         avatar: true, 
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// ============ USAGE & LIMITS ============
app.get('/api/usage', (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const tracker = getTracker(decoded.userId);
  res.json({ success: true, data: tracker.getUsage() });
});

app.get('/api/usage/check/:action', (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const tracker = getTracker(decoded.userId);
  const { action } = req.params;
  
  let result;
  switch (action) {
    case 'message': result = tracker.canSendMessage(); break;
    case 'contact': result = tracker.canAddContact(); break;
    case 'device': result = tracker.canAddDevice(); break;
    default: result = { allowed: true };
  }
  res.json({ success: true, data: result });
});

// ============ SUBSCRIPTION ============
app.get('/api/subscription', (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const sub = subscriptions.get(decoded.userId) || { planId: 'free', status: 'active' };
  const tracker = getTracker(decoded.userId);
  res.json({ success: true, data: { ...sub, plan: PLANS[sub.planId], usage: tracker.getUsage() } });
});

app.post('/api/subscription/cancel', async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const sub = subscriptions.get(decoded.userId);
  if (sub?.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId).catch(() => {});
  }
  subscriptions.set(decoded.userId, { planId: 'free', status: 'active', startedAt: new Date().toISOString() });
  const user = users.find(u => u.id === decoded.userId);
  if (user) user.plan = 'free';
  res.json({ success: true, data: { message: 'Cancelled' } });
});

// ============ STRIPE ============
app.post('/api/stripe/create-checkout', async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const { planId, billingCycle } = req.body;
  const plan = PLANS[planId];
  if (!plan || plan.price === 0 || plan.price === null) {
    return res.status(400).json({ success: false, error: 'Invalid plan' });
  }

  try {
    const unitAmount = billingCycle === 'yearly' ? Math.round(plan.price * 0.8 * 100) : plan.price * 100;
    const interval = billingCycle === 'yearly' ? 'year' : 'month';
    let customerId = subscriptions.get(decoded.userId)?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({ email: decoded.email, metadata: { userId: decoded.userId } });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: { currency: 'usd', product_data: { name: `WhatsFlow ${plan.name}` }, unit_amount: unitAmount, recurring: { interval } },
        quantity: 1,
      }],
      success_url: 'http://localhost:3000/dashboard?payment=success',
      cancel_url: 'http://localhost:3000/upgrade?payment=cancelled',
      metadata: { userId: decoded.userId, planId, billingCycle },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_your_webhook_secret');
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  if (event.type === 'checkout.session.completed') {
    const { userId, planId, billingCycle } = (event.data.object as any).metadata || {};
    subscriptions.set(userId, {
      planId, status: 'active', startedAt: new Date().toISOString(),
      renewsAt: billingCycle === 'yearly' ? new Date(Date.now() + 365*86400000).toISOString() : new Date(Date.now() + 30*86400000).toISOString(),
      stripeSubscriptionId: (event.data.object as any).subscription,
      stripeCustomerId: (event.data.object as any).customer,
    });
    const user = users.find(u => u.id === userId);
    if (user) user.plan = planId;
    // Reset usage on upgrade
    usageStore.delete(userId);
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = (event.data.object as any).customer;
    for (const [uid, sub] of subscriptions.entries()) {
      if (sub.stripeCustomerId === customerId) {
        subscriptions.set(uid, { planId: 'free', status: 'active', startedAt: new Date().toISOString() });
        const user = users.find(u => u.id === uid);
        if (user) user.plan = 'free';
      }
    }
  }

  res.json({ received: true });
});

// ============ CHATS (with limit check) ============
app.post('/api/chats/:id/messages', (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const tracker = getTracker(decoded.userId);
  const check = tracker.canSendMessage();
  if (!check.allowed) {
    return res.status(403).json({ success: false, error: check.reason, code: 'LIMIT_REACHED', upgradeUrl: '/upgrade' });
  }
  tracker.trackMessage();
  res.json({ success: true, data: { id: Date.now().toString(), message: req.body.message } });
});



// ============ DEVICES (with limit check) ============


// devices routes

// ============ BROADCAST (with limit check) ============
app.post('/api/broadcasts', (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const tracker = getTracker(decoded.userId);
  const recipientCount = (req.body.recipients || []).length;
  for (let i = 0; i < recipientCount; i++) {
    const check = tracker.canSendMessage();
    if (!check.allowed) {
      return res.status(403).json({ success: false, error: `Limit reached after sending ${i} messages. ${check.reason}`, code: 'LIMIT_REACHED', upgradeUrl: '/upgrade' });
    }
    tracker.trackMessage();
  }
  res.status(201).json({ success: true, data: { id: Date.now().toString(), ...req.body, status: 'sent', sentCount: recipientCount } });
});

// ============ ANALYTICS ============
app.get('/api/analytics/dashboard', (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
  const tracker = getTracker(decoded.userId);
  const usage = tracker.getUsage();
  res.json({ success: true, data: usage });
});

// ============ STRIPE WEBHOOK ============
app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_0f064416600994d4e41f2b28bd85575849a323374259474dc0f0c826d003d843');
  } catch (err: any) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: err.message });
  }

  console.log('✅ Stripe webhook received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { userId, planId, billingCycle } = session.metadata || {};
    
    console.log('💰 Payment successful! User:', userId, 'Plan:', planId);
    
    if (userId && planId) {
      // Update subscription
      subscriptions.set(userId, {
        planId,
        status: 'active',
        startedAt: new Date().toISOString(),
        renewsAt: billingCycle === 'yearly' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        billingCycle,
      });

      // ✅ UPDATE USER PLAN
      const user = users.find(u => u.id === userId);
      if (user) {
        user.plan = planId;
        console.log('✅ User plan updated to:', planId);
      }

      // Reset usage counters on upgrade
      usageStore.delete(userId);
      console.log('✅ Usage reset for user:', userId);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    const customerId = subscription.customer;
    
    for (const [uid, sub] of subscriptions.entries()) {
      if (sub.stripeCustomerId === customerId) {
        subscriptions.set(uid, {
          planId: 'free',
          status: 'active',
          startedAt: new Date().toISOString(),
          renewsAt: null,
          stripeSubscriptionId: null,
          stripeCustomerId: customerId,
        });
        
        const user = users.find(u => u.id === uid);
        if (user) user.plan = 'free';
        console.log('✅ User downgraded to free:', uid);
      }
    }
  }

  res.json({ received: true });
});

// ============ SIMPLE GET ROUTES ============




app.delete('/api/auth/account', (req, res) => res.json({ success: true, data: { message: 'Deleted' } }));



// ============ TEMPLATES CRUD ============
app.get('/api/templates', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.template.findMany({ 
      where: { userId: decoded.userId }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/templates', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.template.create({ 
      data: { name: req.body.name, content: req.body.content, userId: decoded.userId } 
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.template.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ CHATBOT RULES ============
app.get('/api/chatbot/rules', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.chatbotRule.findMany({ 
      where: { userId: decoded.userId }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/chatbot/rules', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.chatbotRule.create({ 
      data: { keyword: req.body.keyword, reply: req.body.reply, matchType: req.body.matchType || 'contains', active: true, userId: decoded.userId } 
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/chatbot/rules/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.chatbotRule.updateMany({ where: { id: req.params.id, userId: decoded.userId }, data: req.body });
    res.json({ success: true, data: { message: 'Updated' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/chatbot/rules/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.chatbotRule.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ TEAM ============
app.get('/api/team', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const members = await prisma.teamMember.findMany({ where: { userId: decoded.userId } });
    const owner = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { email: true } });
    res.json({ success: true, data: [{ id: 'owner', email: owner?.email || decoded.email, role: 'Owner' }, ...members] });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/team', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.teamMember.create({ data: { email: req.body.email, role: req.body.role || 'member', userId: decoded.userId } });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/team/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.teamMember.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ WEBHOOKS ============
app.get('/api/webhooks', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.webhook.findMany({ where: { userId: decoded.userId } });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/webhooks', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.webhook.create({ data: { url: req.body.url, events: req.body.events || [], userId: decoded.userId } });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/webhooks/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.webhook.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ LOGS ============
app.get('/api/logs', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.apiLog.findMany({ 
      where: { userId: decoded.userId }, 
      orderBy: { createdAt: 'desc' }, 
      take: 100 
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});
// ============ CONTACTS CRUD ============
app.get('/api/contacts', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.contact.findMany({ 
      where: { userId: decoded.userId }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.contact.create({ 
      data: { 
        name: req.body.name, 
        phoneNumber: req.body.phoneNumber, 
        email: req.body.email || '', 
        tags: req.body.tags || [], 
        userId: decoded.userId 
      } 
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.contact.updateMany({ 
      where: { id: req.params.id, userId: decoded.userId }, 
      data: req.body 
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.contact.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ============ BROADCASTS CRUD ============
app.get('/api/broadcasts', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.broadcast.findMany({ 
      where: { userId: decoded.userId }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/broadcasts', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.broadcast.create({ 
      data: { 
        name: req.body.name, 
        message: req.body.message, 
        recipients: req.body.recipients || [], 
        status: 'draft',
        stats: { total: (req.body.recipients || []).length, sent: 0, delivered: 0, read: 0, failed: 0 },
        userId: decoded.userId 
      } 
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/broadcasts/:id/send', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.broadcast.updateMany({ 
      where: { id: req.params.id, userId: decoded.userId }, 
      data: { status: 'sent', sentAt: new Date() } 
    });
    res.json({ success: true, data: { message: 'Broadcast sent' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/broadcasts/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.broadcast.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});
// ============ CAMPAIGNS CRUD ============
app.get('/api/campaigns', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.broadcast.findMany({ 
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/campaigns', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.broadcast.create({ 
      data: { 
        name: req.body.name, 
        message: req.body.message, 
        recipients: req.body.recipients || [], 
        status: req.body.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
        stats: { total: (req.body.recipients || []).length, sent: 0, delivered: 0, read: 0, failed: 0 },
        userId: decoded.userId 
      } 
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/campaigns/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.broadcast.updateMany({ 
      where: { id: req.params.id, userId: decoded.userId }, 
      data: {
        name: req.body.name,
        message: req.body.message,
        recipients: req.body.recipients,
        status: req.body.status,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      }
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.broadcast.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/campaigns/:id/send', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.broadcast.updateMany({ 
      where: { id: req.params.id, userId: decoded.userId }, 
      data: { status: 'sent', sentAt: new Date() } 
    });
    res.json({ success: true, data: { message: 'Campaign sent' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/campaigns/:id/duplicate', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const original = await prisma.broadcast.findFirst({ where: { id: req.params.id, userId: decoded.userId } });
    if (!original) return res.status(404).json({ success: false, error: 'Not found' });
    const data = await prisma.broadcast.create({ 
      data: { 
        name: `${original.name} (Copy)`, 
        message: original.message, 
        recipients: original.recipients, 
        status: 'draft',
        stats: { total: original.recipients.length, sent: 0, delivered: 0, read: 0, failed: 0 },
        userId: decoded.userId 
      } 
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});
// ============ MEDIA CRUD (Database) ============
app.get('/api/media', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const data = await prisma.media.findMany({ 
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/media/upload', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { name, type, size, url } = req.body;
    const data = await prisma.media.create({ 
      data: { name, type, size, url, userId: user.userId }
    });
    console.log('Media saved to DB:', data.name);
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/media/:id', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await prisma.media.deleteMany({ where: { id: req.params.id, userId: user.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// Update Profile
app.put('/api/auth/me', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
    
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: req.body.name,
        email: req.body.email,
      },
      select: { id: true, name: true, email: true, plan: true },
    });
    
    res.json({ success: true, data: updatedUser });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Change Password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    const valid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });
    
    res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});
// Upload avatar
app.post('/api/auth/avatar', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'No token' });
    
    const { avatar } = req.body; // base64 image data
    
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { avatar },
    });
    
    res.json({ success: true, data: { message: 'Photo uploaded', avatar } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});



// ============ DEVICES WITH QR CODE ============
app.get('/api/devices', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const devices = await prisma.device.findMany({ 
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: devices });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/devices/connect', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { name, phoneNumber } = req.body;

    console.log('📱 Connecting device:', name, phoneNumber);

    // Create device in DB
    const device = await prisma.device.create({ 
      data: { name, phoneNumber, status: 'connecting', userId: decoded.userId }
    });
    console.log('📱 Device saved to DB:', device.id);

    // Start WhatsApp session to get QR code
    try {
      console.log('📱 Starting WhatsApp session...');
      const qrResult = await sessionManager.createSession(device.id, decoded.userId, phoneNumber);
      console.log('📱 QR Result:', qrResult ? 'Received' : 'NULL');
      
     res.status(201).json({ 
  success: true, 
  data: {
    ...device,
    qrCode: (qrResult as any)?.qrCode || null,
    qrDataUrl: (qrResult as any)?.qrDataUrl || null,
  }
});
    } catch (sessionError: any) {
      console.error('❌ Session error:', sessionError.message);
      // Still return the device even if QR fails
      res.status(201).json({ 
        success: true, 
        data: { ...device, qrCode: null, qrDataUrl: null }
      });
    }

  } catch (e: any) { 
    console.error('❌ Connect error:', e);
    res.status(500).json({ success: false, error: e.message }); 
  }
});

app.get('/api/devices/:id/qr', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const qrData = sessionManager.getQRCode(req.params.id) as { qrCode?: string; qrDataUrl?: string } | null;
    if (!qrData) return res.status(404).json({ success: false, error: 'No QR code available' });
    res.json({ success: true, data: qrData });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/devices/:id/disconnect', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await sessionManager.disconnectDevice(req.params.id);
    await prisma.device.updateMany({ 
      where: { id: req.params.id, userId: decoded.userId },
      data: { status: 'disconnected', lastSeen: new Date() }
    });
    res.json({ success: true, data: { message: 'Disconnected' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/devices/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await sessionManager.disconnectDevice(req.params.id);
    await prisma.device.deleteMany({ where: { id: req.params.id, userId: decoded.userId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});
// ============ BLOG ROUTES ============
app.get('/api/blog', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true, coverImage: true,
        author: true, category: true, tags: true, createdAt: true,
      },
    });
    res.json({ success: true, data: posts });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/blog/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: post });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});
// ============ START ============
const PORT = 3001;

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`💳 Stripe: http://localhost:${PORT}/api/stripe/create-checkout`);
  console.log(`📊 Usage: http://localhost:${PORT}/api/usage`);
  console.log(`🔒 Limits enforced on: messages, contacts, devices`);
  console.log('========================================');
});
