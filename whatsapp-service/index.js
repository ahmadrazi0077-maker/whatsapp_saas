const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const clients = new Map();

// Connect device
app.post('/api/connect', async (req, res) => {
  const { deviceId, workspaceId } = req.body;
  
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: deviceId,
      dataPath: `./sessions/${workspaceId}/${deviceId}`
    }),
    puppeteer: { headless: true }
  });
  
  clients.set(deviceId, client);
  
  client.on('qr', async (qr) => {
    const qrCodeDataURL = await QRCode.toDataURL(qr);
    await supabase.from('devices').update({ qr_code: qrCodeDataURL }).eq('id', deviceId);
  });
  
  client.on('ready', async () => {
    await supabase.from('devices').update({ status: 'connected' }).eq('id', deviceId);
  });
  
  await client.initialize();
  
  res.json({ success: true });
});

app.listen(4001, () => console.log('WhatsApp service running on port 4001'));
