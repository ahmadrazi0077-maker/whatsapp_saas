import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  makeInMemoryStore,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import { supabase } from '../../lib/supabase';

export class WhatsAppClient {
  private sock: any;
  private deviceId: string;
  private workspaceId: string;
  private isConnecting = false;
  private qrCallback: (qr: string) => void;

  constructor(deviceId: string, workspaceId: string, onQR: (qr: string) => void) {
    this.deviceId = deviceId;
    this.workspaceId = workspaceId;
    this.qrCallback = onQR;
  }

  async connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    const { state, saveCreds } = await useMultiFileAuthState(`./auth/${this.workspaceId}/${this.deviceId}`);
    
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent' }) });

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.macOS('Desktop'),
      logger: pino({ level: 'silent' }),
    });

    store.bind(this.sock.ev);

    // Handle QR Code
    this.sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        const qrImage = await QRCode.toDataURL(qr);
        this.qrCallback(qrImage);
        
        // Save QR to database
        await supabase
          .from('devices')
          .update({ qr_code: qrImage, status: 'awaiting_scan' })
          .eq('id', this.deviceId);
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log('Reconnecting...');
          this.connect();
        } else {
          await supabase
            .from('devices')
            .update({ status: 'disconnected' })
            .eq('id', this.deviceId);
        }
      }
      
      if (connection === 'open') {
        console.log('WhatsApp connected!');
        
        // Get device info
        const info = this.sock.user;
        await supabase
          .from('devices')
          .update({
            status: 'connected',
            phone_number: info.id.split(':')[0],
            last_connected: new Date().toISOString(),
            qr_code: null,
          })
          .eq('id', this.deviceId);
      }
    });

    // Handle incoming messages
    this.sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (!msg.message) continue;
        
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (body && !msg.key.fromMe) {
          // Save incoming message to database
          await this.saveIncomingMessage(from, body);
          
          // Emit to WebSocket
          global.io?.to(`workspace:${this.workspaceId}`).emit('new-message', {
            from,
            body,
            timestamp: msg.messageTimestamp,
          });
        }
      }
    });

    this.sock.ev.on('creds.update', saveCreds);
    this.isConnecting = false;
  }

  async sendMessage(to: string, message: string): Promise<any> {
    if (!this.sock) throw new Error('WhatsApp not connected');
    
    const formattedNumber = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    return await this.sock.sendMessage(formattedNumber, { text: message });
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout();
    }
  }

  private async saveIncomingMessage(from: string, body: string) {
    // Find or create contact
    const { data: contact } = await supabase
      .from('contacts')
      .upsert({
        phone_number: from.split('@')[0],
        workspace_id: this.workspaceId,
      })
      .select()
      .single();
    
    // Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('contact_id', contact.id)
      .eq('device_id', this.deviceId)
      .single();
    
    if (!conversation) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          contact_id: contact.id,
          device_id: this.deviceId,
          workspace_id: this.workspaceId,
        })
        .select()
        .single();
      conversation = newConv;
    }
    
    // Save message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        body,
        from_me: false,
      });
    
    // Update conversation
    await supabase
      .from('conversations')
      .update({
        last_message: body,
        last_message_at: new Date().toISOString(),
        unread_count: supabase.sql`unread_count + 1`,
      })
      .eq('id', conversation.id);
  }
}
