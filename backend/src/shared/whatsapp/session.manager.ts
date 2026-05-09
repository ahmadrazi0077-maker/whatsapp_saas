import { EventEmitter } from 'events';
import QRCode from 'qrcode';

const EVOLUTION_API_URL = 'http://localhost:8080';
const EVOLUTION_API_KEY = 'my-evolution-api-key-2024';

class SessionManager extends EventEmitter {
  private sessions: Map<string, any> = new Map();

  async createSession(deviceId: string, userId: string, phoneNumber: string) {
    console.log('📱 Creating Evolution API instance:', deviceId);

    try {
      // Create instance in Evolution API
      const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          instanceName: deviceId,
          token: userId,
          qrcode: true,
          number: phoneNumber,
        }),
      });

      const createData = await createRes.json();
      console.log('Instance created:', createData);

      // Connect and get QR code
      const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${deviceId}`, {
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY },
      });
 const connectData = await connectRes.json() as any;
      
      if (connectData.qrcode?.base64) {
        const qrDataUrl = `data:image/png;base64,${connectData.qrcode.base64}`;
        
        this.sessions.set(deviceId, {
          deviceId, userId, phoneNumber,
          status: 'connecting',
          qrCode: connectData.qrcode.base64,
          qrDataUrl,
        });

        console.log('✅ QR received from Evolution API');
        this.emit('qr:received', { deviceId, qr: connectData.qrcode.base64, qrDataUrl, userId });

        // Poll for connection status
        this.pollConnectionStatus(deviceId, userId, phoneNumber);

        return { qrCode: connectData.qrcode.base64, qrDataUrl };
      }

    } catch (error: any) {
      console.error('Evolution API error:', error.message);
      // Fallback to local QR generation
      return this.createLocalQR(deviceId, userId, phoneNumber);
    }

    return null;
  }

  private async pollConnectionStatus(deviceId: string, userId: string, phoneNumber: string) {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${deviceId}`, {
          headers: { 'apikey': EVOLUTION_API_KEY },
        });
        const data = await res.json() as any;
        
        if (data.instance?.state === 'open') {
          const session = this.sessions.get(deviceId);
          if (session) {
            session.status = 'connected';
            session.qrCode = null;
            session.qrDataUrl = null;
            console.log('🎉 Device connected via Evolution API:', deviceId);
            this.emit('device:ready', { deviceId, userId, phoneNumber });
            return;
          }
        }
        
        // Keep polling
        setTimeout(checkStatus, 2000);
      } catch (e) {}
    };
    
    setTimeout(checkStatus, 3000);
  }

  private async createLocalQR(deviceId: string, userId: string, phoneNumber: string) {
    const QRCode = require('qrcode');
    const qrData = `WA:${deviceId}:${Date.now()}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      color: { dark: '#128C7E', light: '#FFFFFF' }, width: 300,
    });

    this.sessions.set(deviceId, {
      deviceId, userId, phoneNumber,
      status: 'connecting', qrCode: qrData, qrDataUrl,
    });

    setTimeout(() => {
      const s = this.sessions.get(deviceId);
      if (s) {
        s.status = 'connected';
        s.qrCode = null;
        s.qrDataUrl = null;
        this.emit('device:ready', { deviceId, userId, phoneNumber });
      }
    }, 3000);

    return { qrCode: qrData, qrDataUrl };
  }

  async sendMessage(deviceId: string, to: string, message: string) {
    try {
      const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: to,
          text: message,
        }),
      });
      return await res.json();
    } catch (e: any) {
      console.error('Send message error:', e.message);
      throw e;
    }
  }

  getQRCode(deviceId: string) {
    const s = this.sessions.get(deviceId);
    return s ? { qrCode: s.qrCode || '', qrDataUrl: s.qrDataUrl || '' } : null;
  }

  getStatus(deviceId: string) {
    return this.sessions.get(deviceId)?.status || null;
  }

  async disconnectDevice(deviceId: string) {
    try {
      await fetch(`${EVOLUTION_API_URL}/instance/logout/${deviceId}`, {
        method: 'DELETE',
        headers: { 'apikey': EVOLUTION_API_KEY },
      });
    } catch (e) {}
    this.sessions.delete(deviceId);
  }
}

export const sessionManager = new SessionManager();