import { EasyPaisaGateway } from '../../config/paymentGateways/easypaisa';
import { JazzCashGateway } from '../../config/paymentGateways/jazzcash';
import { StripeGateway } from '../../config/paymentGateways/stripe';
import { prisma } from '../../prisma/client';

export class PaymentService {
  private easyPaisa: EasyPaisaGateway;
  private jazzCash: JazzCashGateway;
  private stripe: StripeGateway;

  constructor() {
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
    
    this.stripe = new StripeGateway();
  }

  async processPayment({
    amount,
    currency,
    gateway,
    userId,
    planId,
    workspaceId,
  }: {
    amount: number;
    currency: string;
    gateway: 'EASYPAISA' | 'JAZZCASH' | 'STRIPE';
    userId: string;
    planId: string;
    workspaceId: string;
  }) {
    try {
      const orderId = `ORD_${Date.now()}_${userId.slice(0, 8)}`;
      
      let paymentResult;
      
      switch (gateway) {
        case 'EASYPAISA':
          paymentResult = await this.easyPaisa.createPayment(amount, orderId, userId);
          break;
        case 'JAZZCASH':
          paymentResult = await this.jazzCash.createPayment(amount, orderId, userId);
          break;
        case 'STRIPE':
          paymentResult = await this.stripe.createPaymentSession(amount, currency, userId, {
            userId,
            planId,
            workspaceId,
          });
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }
      
      // Save transaction record
      const transaction = await prisma.localPaymentTransaction.create({
        data: {
          userId,
          regionId: (await this.getUserRegion(userId)).id,
          gateway,
          transactionId: paymentResult.transactionId || paymentResult.sessionId,
          amount,
          currency,
          status: 'PENDING',
          metadata: {
            orderId,
            planId,
            workspaceId,
            paymentUrl: paymentResult.paymentUrl,
          },
        },
      });
      
      return {
        success: true,
        transactionId: transaction.id,
        paymentUrl: paymentResult.paymentUrl,
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw new Error('Payment processing failed');
    }
  }

  async verifyPayment(transactionId: string, gateway: string) {
    try {
      let verificationResult;
      
      switch (gateway) {
        case 'EASYPAISA':
          verificationResult = await this.easyPaisa.verifyPayment(transactionId);
          break;
        case 'JAZZCASH':
          verificationResult = await this.jazzCash.verifyPayment(transactionId);
          break;
        case 'STRIPE':
          // Stripe verification is handled via webhook
          verificationResult = { success: true };
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }
      
      if (verificationResult.success) {
        await prisma.localPaymentTransaction.update({
          where: { transactionId },
          data: { status: 'SUCCESS' }
        });
      }
      
      return verificationResult;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }

  private async getUserRegion(userId: string) {
    const userRegion = await prisma.userRegion.findFirst({
      where: { userId, isSelected: true },
      include: { region: true },
    });
    
    return userRegion?.region || { id: '1', code: 'PK', currency: 'PKR' };
  }
}