import axios from 'axios';
import crypto from 'crypto';

interface JazzCashConfig {
  merchantId: string;
  password: string;
  integritySalt: string;
  environment: 'sandbox' | 'production';
}

export class JazzCashGateway {
  private config: JazzCashConfig;
  private baseUrl: string;

  constructor(config: JazzCashConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.jazzcash.com.pk/v1'
      : 'https://sandbox.jazzcash.com.pk/v1';
  }

  async createPayment(amount: number, orderId: string, customerId: string) {
    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const payload = {
        pp_MerchantID: this.config.merchantId,
        pp_Password: this.config.password,
        pp_Amount: amount,
        pp_TxnDateTime: timestamp,
        pp_TxnRefNo: orderId,
        pp_TxnCurrency: 'PKR',
        pp_BillToEmail: customerId,
        pp_BillToMobile: customerId,
        pp_Language: 'EN',
        pp_Version: '1.1',
        pp_ReturnURL: `${process.env.APP_URL}/payment/callback`,
        pp_IpnURL: `${process.env.API_URL}/webhooks/jazzcash`,
      };

      // Generate integrity hash
      const integrityHash = this.generateIntegrityHash(payload);
      payload['pp_SecureHash'] = integrityHash;

      const response = await axios.post(`${this.baseUrl}/Payment/Initiate`, payload);
      
      return {
        success: true,
        paymentUrl: response.data.pp_PaymentURL,
        transactionId: response.data.pp_TxnRefNo,
      };
    } catch (error) {
      console.error('JazzCash payment creation failed:', error);
      throw new Error('Payment initialization failed');
    }
  }

  async verifyPayment(orderId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/Payment/Status`, {
        params: {
          pp_MerchantID: this.config.merchantId,
          pp_Password: this.config.password,
          pp_TxnRefNo: orderId,
        },
      });
      
      return {
        success: response.data.pp_ResponseCode === '000',
        transactionId: orderId,
        amount: response.data.pp_Amount,
        status: response.data.pp_ResponseMessage,
      };
    } catch (error) {
      console.error('JazzCash verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }

  private generateIntegrityHash(payload: any): string {
    const sortedKeys = Object.keys(payload).sort();
    const stringToHash = sortedKeys.map(key => payload[key]).join('&');
    const hash = crypto
      .createHmac('sha256', this.config.integritySalt)
      .update(stringToHash)
      .digest('hex');
    return hash;
  }
}