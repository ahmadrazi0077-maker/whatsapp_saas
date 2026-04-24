import { prisma } from '../../prisma/client';
import { StripeGateway } from '../../config/paymentGateways/stripe';
import { EasyPaisaGateway } from '../../config/paymentGateways/easypaisa';
import { JazzCashGateway } from '../../config/paymentGateways/jazzcash';

export class SubscriptionManager {
  private stripe: StripeGateway;
  private easyPaisa: EasyPaisaGateway;
  private jazzCash: JazzCashGateway;
  
  constructor() {
    this.stripe = new StripeGateway();
    this.easyPaisa = new EasyPaisaGateway({
      merchantId: process.env.EASYPAISA_MERCHANT_ID!,
      username: process.env.EASYPAISA_USERNAME!,
      password: process.env.EASYPAISA_PASSWORD!,
      hashKey: process.env.EASYPAISA_HASH_KEY!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    });
    this.jazzCash = new JazzCashGateway({
      merchantId: process.env.JAZZCASH_MERCHANT_ID!,
      password: process.env.JAZZCASH_PASSWORD!,
      integritySalt: process.env.JAZZCASH_INTEGRITY_SALT!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    });
  }
  
  async createSubscription(workspaceId: string, planId: string, paymentMethod: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    
    if (!workspace || !plan) {
      throw new Error('Workspace or plan not found');
    }
    
    // Create or get Stripe customer
    let stripeCustomerId = workspace.stripeCustomerId;
    if (!stripeCustomerId && paymentMethod === 'STRIPE') {
      const customer = await this.stripe.createCustomer(
        workspace.users[0]?.email || '',
        workspace.name
      );
      stripeCustomerId = customer.id;
      
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { stripeCustomerId },
      });
    }
    
    // Create subscription based on payment method
    let subscription;
    switch (paymentMethod) {
      case 'STRIPE':
        subscription = await this.stripe.createSubscription(stripeCustomerId!, plan.stripePriceId!);
        break;
      case 'EASYPAISA':
        // Create local payment record
        const easyPaisaPayment = await this.easyPaisa.createPayment(
          plan.price,
          `SUB_${workspaceId}_${Date.now()}`,
          workspaceId
        );
        subscription = { paymentUrl: easyPaisaPayment.paymentUrl };
        break;
      case 'JAZZCASH':
        const jazzCashPayment = await this.jazzCash.createPayment(
          plan.price,
          `SUB_${workspaceId}_${Date.now()}`,
          workspaceId
        );
        subscription = { paymentUrl: jazzCashPayment.paymentUrl };
        break;
      default:
        throw new Error('Unsupported payment method');
    }
    
    // Save subscription
    const savedSubscription = await prisma.subscription.create({
      data: {
        workspaceId,
        planId,
        status: 'PENDING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: subscription.id,
      },
    });
    
    return {
      subscription: savedSubscription,
      paymentUrl: subscription.paymentUrl,
    };
  }
  
  async cancelSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { workspace: true },
    });
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    
    if (subscription.stripeSubscriptionId) {
      await this.stripe.cancelSubscription(subscription.stripeSubscriptionId);
    }
    
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELED', cancelAtPeriodEnd: true },
    });
    
    await prisma.workspace.update({
      where: { id: subscription.workspaceId },
      data: { plan: 'FREE' },
    });
    
    return { success: true };
  }
  
  async checkUsage(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: { include: { plan: true } } },
    });
    
    if (!workspace) throw new Error('Workspace not found');
    
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    
    const messagesSent = await prisma.message.count({
      where: {
        workspaceId,
        fromMe: true,
        timestamp: { gte: currentMonthStart },
      },
    });
    
    const limit = workspace.subscription?.plan?.messageLimit || 1000;
    const percentage = (messagesSent / limit) * 100;
    
    return {
      used: messagesSent,
      limit,
      percentage,
      isOverLimit: messagesSent >= limit,
      remaining: Math.max(0, limit - messagesSent),
    };
  }
}