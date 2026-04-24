import Stripe from 'stripe';

export class StripeGateway {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentSession(amount: number, currency: string, customerId: string, metadata: any) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: 'WhatsApp SaaS Subscription',
                description: metadata.planName,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/payment/cancel`,
        customer: customerId,
        metadata: metadata,
      });
      
      return {
        success: true,
        sessionId: session.id,
        paymentUrl: session.url,
      };
    } catch (error) {
      console.error('Stripe session creation failed:', error);
      throw new Error('Payment session creation failed');
    }
  }

  async createCustomer(email: string, name: string, metadata?: any) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
      
      return customer;
    } catch (error) {
      console.error('Stripe customer creation failed:', error);
      throw new Error('Customer creation failed');
    }
  }

  async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      return subscription;
    } catch (error) {
      console.error('Stripe subscription creation failed:', error);
      throw new Error('Subscription creation failed');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Stripe subscription cancellation failed:', error);
      throw new Error('Subscription cancellation failed');
    }
  }

  async handleWebhook(payload: any, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutComplete(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object);
          break;
      }
      
      return { received: true };
    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw new Error('Webhook handling failed');
    }
  }

  private async handleCheckoutComplete(session: any) {
    // Update database with successful payment
    await prisma.localPaymentTransaction.update({
      where: { transactionId: session.id },
      data: { status: 'SUCCESS' }
    });
  }

  private async handlePaymentSuccess(invoice: any) {
    // Update subscription status
    await prisma.subscription.update({
      where: { stripeSubscriptionId: invoice.subscription },
      data: { status: 'ACTIVE' }
    });
  }

  private async handleSubscriptionCanceled(subscription: any) {
    // Update subscription status
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'CANCELED' }
    });
  }
}