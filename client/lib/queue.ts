import { Queue, Worker } from 'bullmq';
import { redis } from './redis';

export const broadcastQueue = new Queue('broadcast', { connection: redis });

export const broadcastWorker = new Worker('broadcast', async (job) => {
  const { campaignId, message, contacts } = job.data;
  // Process broadcast
}, { connection: redis });
