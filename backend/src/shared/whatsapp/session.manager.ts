import { EventEmitter } from 'events';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-d903.up.railway.app';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'ahmad_whatsapp_saas_2026';

class SessionManager extends EventEmitter {
  async createSession(deviceId: string, userId: string, phoneNumber: string) {
    // Create instance in Evolution API
    const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
      body: JSON.stringify({ instanceName: deviceId, token: userId, qrcode: true, number: phoneNumber }),
    });
    const data = await res.json();
    
    // Get QR code
    const qrRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${deviceId}`, {
      headers: { 'apikey': EVOLUTION_API_KEY },
    });
    const qrData = await qrRes.json();
    
    return { qrCode: qrData.qrcode?.base64 || null, qrDataUrl: qrData.qrcode?.base64 ? `data:image/png;base64,${qrData.qrcode.base64}` : null };
  }

  async sendMessage(deviceId: string, to: string, message: string) {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${deviceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
      body: JSON.stringify({ number: to, text: message }),
    });
  }

  async disconnectDevice(deviceId: string) {
    await fetch(`${EVOLUTION_API_URL}/instance/logout/${deviceId}`, {
      method: 'DELETE',
      headers: { 'apikey': EVOLUTION_API_KEY },
    });
  }

  getQRCode(deviceId: string) { return null; }
  getStatus(deviceId: string) { return null; }
}

export const sessionManager = new SessionManager();
