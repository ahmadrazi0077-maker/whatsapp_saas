import axios from 'axios';
import crypto from 'crypto';

interface EasyPaisaConfig {
  merchantId: string;
  username: string;
  password: string;
  hashKey: string;
  environment: 'sandbox' | 'production';
}

export class EasyPaisaGateway {
  private config: EasyPaisaConfig;
  private baseUrl: string;

  constructor(config: EasyPaisaConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.easypaisa.com.pk/v1'
      : 'https://sandbox.easypaisa.com.pk/v1';
  }

  async createPayment(amount: number, orderId: string, customerId: string) {
    try {
      const payload = {
        merchantId: this.config.merchantId,
        username: this.config.username,
        password: this.config.password,
        orderId: orderId,
        amount: amount,
        currency: 'PKR',
        customerId: customerId,
        returnUrl: `${process.env.APP_URL}/payment/callback`,
        ipnUrl: `${process.env.API_URL}/webhooks/easypaisa`,
        timestamp: new Date().toISOString(),
      };

      // Generate signature
      const signature = this.generateSignature(payload);
      payload['signature'] = signature;

      const response = await axios.post(`${this.baseUrl}/payment/initiate`, payload);
      
      return {
        success: true,
        paymentUrl: response.data.paymentUrl,
        transactionId: response.data.transactionId,
      };
    } catch (error) {
      console.error('EasyPaisa payment creation failed:', error);
      throw new Error('Payment initialization failed');
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/payment/status/${transactionId}`, {
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
      });
      
      return {
        success: response.data.status === 'COMPLETED',
        transactionId: transactionId,
        amount: response.data.amount,
        status: response.data.status,
      };
    } catch (error) {
      console.error('EasyPaisa verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }

  async refundPayment(transactionId: string, amount: number) {
    try {
      const response = await axios.post(`${this.baseUrl}/payment/refund`, {
        transactionId,
        amount,
        merchantId: this.config.merchantId,
      });
      
      return {
        success: response.data.status === 'REFUNDED',
        refundId: response.data.refundId,
      };
    } catch (error) {
      console.error('EasyPaisa refund failed:', error);
      throw new Error('Refund failed');
    }
  }

  private generateSignature(payload: any): string {
    const stringToSign = `${payload.merchantId}${payload.orderId}${payload.amount}${payload.timestamp}`;
    return crypto
      .createHmac('sha256', this.config.hashKey)
      .update(stringToSign)
      .digest('hex');
  }
}