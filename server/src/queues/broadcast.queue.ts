import { Queue, Worker } from 'bull';
import Redis from 'ioredis';
import { prisma } from '../prisma/client';
import { WhatsAppClient } from '../services/whatsapp/WhatsAppClient';

const redis = new Redis(process.env.REDIS_URL!);
const broadcastQueue = new Queue('broadcast', { connection: redis });

// Worker to process broadcast jobs
const worker = new Worker('broadcast', async (job) => {
  const { campaignId, batchNumber, contacts, deviceId, message } = job.data;
  
  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new Error('Device not found');
  
  const whatsapp = new WhatsAppClient(deviceId, device.workspaceId);
  await whatsapp.initialize();
  
  const results = [];
  
  for (const contact of contacts) {
    try {
      // Personalize message
      let personalizedMessage = message;
      if (contact.name) {
        personalizedMessage = message.replace(/{name}/g, contact.name);
      }
      
      const result = await whatsapp.sendMessage(contact.phoneNumber, personalizedMessage);
      
      // Save broadcast history
      await prisma.broadcastHistory.create({
        data: {
          campaignId,
          contactId: contact.id,
          status: 'SENT',
          sentAt: new Date(),
          messageId: result.messageId,
        },
      });
      
      results.push({ success: true, contact: contact.id });
      
      // Update campaign stats
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount: { increment: 1 } },
      });
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Failed to send to ${contact.phoneNumber}:`, error);
      
      await prisma.broadcastHistory.create({
        data: {
          campaignId,
          contactId: contact.id,
          status: 'FAILED',
          errorMessage: error.message,
        },
      });
      
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { failedCount: { increment: 1 } },
      });
      
      results.push({ success: false, contact: contact.id, error: error.message });
    }
  }
  
  // Check if last batch
  const totalBatches = Math.ceil(contacts.length / 100);
  if (batchNumber === totalBatches - 1) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }
  
  return results;
});

worker.on('completed', (job) => {
  console.log(`Broadcast job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Broadcast job ${job.id} failed:`, err);
});

export async function scheduleBroadcast(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      broadcastList: { include: { contacts: true } },
      device: true,
    },
  });
  
  if (!campaign) throw new Error('Campaign not found');
  
  const contacts = campaign.broadcastList.contacts;
  const batchSize = 100;
  const batches = Math.ceil(contacts.length / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const batchContacts = contacts.slice(i * batchSize, (i + 1) * batchSize);
    
    await broadcastQueue.add('send-batch', {
      campaignId,
      batchNumber: i,
      contacts: batchContacts,
      deviceId: campaign.deviceId,
      message: campaign.message,
    }, {
      delay: i * 60 * 1000, // 1 minute between batches
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
  
  return { batches };
}

export { broadcastQueue };