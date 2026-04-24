import axios from 'axios';
import { prisma } from '../../prisma/client';

export class WebhookService {
  async sendWebhook(workspaceId: string, event: string, data: any) {
    try {
      const device = await prisma.device.findFirst({
        where: { workspaceId, webhookUrl: { not: null } },
      });
      
      if (!device?.webhookUrl) {
        return;
      }
      
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        workspaceId,
        data,
      };
      
      await axios.post(device.webhookUrl, payload, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': this.generateSignature(payload),
        },
      });
    } catch (error) {
      console.error('Webhook delivery failed:', error);
    }
  }
  
  private generateSignature(payload: any): string {
    // Implement webhook signature generation
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
  
  async registerWebhook(deviceId: string, webhookUrl: string) {
    return await prisma.device.update({
      where: { id: deviceId },
      data: { webhookUrl },
    });
  }
  
  async testWebhook(webhookUrl: string) {
    try {
      const response = await axios.post(webhookUrl, {
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'Webhook test from WhatsApp SaaS',
      });
      
      return {
        success: response.status === 200,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}