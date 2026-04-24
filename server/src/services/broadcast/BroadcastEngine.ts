import { Queue, Worker } from 'bull';
import Redis from 'ioredis';
import { WhatsAppClient } from '../whatsapp/WhatsAppClient';
import { prisma } from '../../prisma/client';

export class BroadcastEngine {
  private queue: Queue;
  private redis: Redis;
  private workers: Map<string, Worker> = new Map();

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.queue = new Queue('broadcast-queue', {
      connection: this.redis,
    });
    
    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker(
      'broadcast-queue',
      async (job) => {
        const { campaignId, batchNumber } = job.data;
        await this.processBroadcastBatch(campaignId, batchNumber);
      },
      { connection: this.redis }
    );
    
    worker.on('completed', (job) => {
      console.log(`Broadcast job ${job.id} completed`);
    });
    
    worker.on('failed', (job, err) => {
      console.error(`Broadcast job ${job.id} failed:`, err);
    });
    
    this.workers.set('broadcast', worker);
  }

  async scheduleBroadcast(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        broadcastList: {
          include: {
            contacts: true,
          },
        },
        device: true,
      },
    });
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    // Update campaign status
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'SCHEDULED' },
    });
    
    // Calculate batches (e.g., 100 contacts per batch)
    const contacts = campaign.broadcastList.contacts;
    const batchSize = 100;
    const batches = Math.ceil(contacts.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const batchContacts = contacts.slice(i * batchSize, (i + 1) * batchSize);
      
      await this.queue.add('broadcast-batch', {
        campaignId,
        batchNumber: i,
        contacts: batchContacts,
      }, {
        delay: i * 60 * 1000, // 1 minute delay between batches
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    }
    
    return { success: true, batches };
  }

  private async processBroadcastBatch(campaignId: string, batchNumber: number) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        device: true,
        broadcastList: {
          include: {
            contacts: true,
          },
        },
      },
    });
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    const startIndex = batchNumber * 100;
    const endIndex = startIndex + 100;
    const batchContacts = campaign.broadcastList.contacts.slice(startIndex, endIndex);
    
    // Initialize WhatsApp client
    const whatsapp = new WhatsAppClient(campaign.device.id, campaign.device.workspaceId);
    await whatsapp.initialize();
    
    // Send messages to batch contacts
    for (const contact of batchContacts) {
      try {
        // Personalize message with contact name
        let personalizedMessage = campaign.message;
        if (contact.name) {
          personalizedMessage = personalizedMessage.replace(/\{name\}/g, contact.name);
        }
        
        const result = await whatsapp.sendMessage(contact.phoneNumber, personalizedMessage);
        
        // Update broadcast history
        await prisma.broadcastHistory.create({
          data: {
            campaignId,
            contactId: contact.id,
            status: 'SENT',
            sentAt: new Date(),
            messageId: result.messageId,
          },
        });
        
        // Update campaign stats
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            sentCount: { increment: 1 },
            totalRecipients: { increment: 1 },
          },
        });
        
        // Add delay to avoid rate limiting
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
          data: {
            failedCount: { increment: 1 },
          },
        });
      }
    }
    
    // Check if this was the last batch
    const totalBatches = Math.ceil(campaign.broadcastList.contacts.length / 100);
    if (batchNumber === totalBatches - 1) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }
  }

  async cancelBroadcast(campaignId: string) {
    // Remove pending jobs
    const jobs = await this.queue.getJobs(['waiting', 'delayed']);
    
    for (const job of jobs) {
      if (job.data.campaignId === campaignId) {
        await job.remove();
      }
    }
    
    // Update campaign status
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' },
    });
    
    return { success: true };
  }

  async getCampaignStatus(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        broadcastList: true,
      },
    });
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    const totalContacts = campaign.broadcastList.contactCount;
    const sent = campaign.sentCount;
    const delivered = campaign.deliveredCount;
    const read = campaign.readCount;
    const failed = campaign.failedCount;
    
    return {
      status: campaign.status,
      progress: {
        sent: sent,
        delivered: delivered,
        read: read,
        failed: failed,
        total: totalContacts,
        percentage: (sent / totalContacts) * 100,
      },
      scheduledFor: campaign.scheduledFor,
      sentAt: campaign.sentAt,
      completedAt: campaign.completedAt,
    };
  }
}