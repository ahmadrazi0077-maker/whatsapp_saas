import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis';

// Queue for broadcast messages
export const broadcastQueue = new Queue('broadcast', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Worker for processing broadcasts
export const broadcastWorker = new Worker('broadcast',
  async (job) => {
    const { campaignId, message, contactIds, workspaceId } = job.data;
    
    console.log(`Processing broadcast ${campaignId} for ${contactIds?.length || 0} contacts`);
    
    // Here you would integrate with WhatsApp API
    // For now, just simulate processing
    for (let i = 0; i < (contactIds?.length || 0); i++) {
      await job.updateProgress(Math.floor(((i + 1) / contactIds.length) * 100));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate send
    }
    
    return { success: true, sent: contactIds?.length || 0 };
  },
  { connection: redis }
);

broadcastWorker.on('completed', (job) => {
  console.log(`Broadcast job ${job.id} completed`);
});

broadcastWorker.on('failed', (job, err) => {
  console.error(`Broadcast job ${job?.id} failed:`, err);
});
