import { Worker } from 'bullmq';
import { redis } from '../lib/redis';
import { WhatsAppClient } from '../services/whatsapp/WhatsAppClient';
import { supabase } from '../lib/supabase';

// Store active WhatsApp clients
const clients = new Map();

export const broadcastWorker = new Worker('broadcast',
  async (job) => {
    const { campaignId, message, contactIds, workspaceId, deviceId } = job.data;
    
    console.log(`📢 Processing broadcast ${campaignId} for ${contactIds.length} contacts`);
    
    // Get or create WhatsApp client
    let whatsapp = clients.get(deviceId);
    if (!whatsapp) {
      whatsapp = new WhatsAppClient(deviceId, workspaceId, (qr) => {
        console.log('QR Code generated for device', deviceId);
      });
      await whatsapp.connect();
      clients.set(deviceId, whatsapp);
    }
    
    let sent = 0;
    let failed = 0;
    
    for (let i = 0; i < contactIds.length; i++) {
      const contactId = contactIds[i];
      
      try {
        // Get contact details
        const { data: contact } = await supabase
          .from('contacts')
          .select('phone_number, name')
          .eq('id', contactId)
          .single();
        
        if (!contact) {
          failed++;
          continue;
        }
        
        // Personalize message
        const personalizedMessage = message.replace(/{name}/g, contact.name || 'Customer');
        
        // Send message
        await whatsapp.sendMessage(contact.phone_number, personalizedMessage);
        sent++;
        
        // Update progress
        await job.updateProgress(Math.floor(((i + 1) / contactIds.length) * 100));
        
        // Update campaign stats
        await supabase
          .from('campaigns')
          .update({ sent_count: sent })
          .eq('id', campaignId);
        
        // Rate limiting (anti-ban)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Failed to send to contact ${contactId}:`, error);
        failed++;
      }
    }
    
    // Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        sent_count: sent,
        failed_count: failed,
      })
      .eq('id', campaignId);
    
    return { success: true, sent, failed };
  },
  { connection: redis, concurrency: 5 }
);

console.log('🚀 Broadcast worker started');
