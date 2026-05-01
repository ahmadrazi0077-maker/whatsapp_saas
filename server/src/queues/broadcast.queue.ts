import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis';

// Define the queue
export const broadcastQueue = new Queue('broadcast', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Define the worker
export const broadcastWorker = new Worker('broadcast',
  async (job) => {
    const { campaignId, message, contactIds, workspaceId } = job.data;
    
    console.log(`Processing broadcast ${campaignId} to ${contactIds.length} contacts`);
    
    try {
      // Process each contact
      for (const contactId of contactIds) {
        // Get contact details
        const { data: contact } = await supabase
          .from('contacts')
          .select('phone_number, name')
          .eq('id', contactId)
          .single();
        
        // Personalized message
        const personalizedMessage = message.replace(/{name}/g, contact?.name || 'Customer');
        
        // Send via WhatsApp (implement later)
        console.log(`Sending to ${contact?.phone_number}: ${personalizedMessage}`);
        
        // Update progress
        await supabase
          .from('campaigns')
          .update({ sent_count: job.progress + 1 })
          .eq('id', campaignId);
        
        await job.updateProgress(job.progress + 1);
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Update campaign status
      await supabase
        .from('campaigns')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('id', campaignId);
      
      return { success: true, sent: contactIds.length };
    } catch (error) {
      console.error(`Broadcast ${campaignId} failed:`, error);
      await supabase
        .from('campaigns')
        .update({ status: 'FAILED' })
        .eq('id', campaignId);
      throw error;
    }
  },
  { connection: redis }
);

// Handle worker events
broadcastWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

broadcastWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

// Function to add broadcast to queue
export async function scheduleBroadcast(campaignId: string, message: string, contactIds: string[], workspaceId: string) {
  const job = await broadcastQueue.add('send-broadcast', {
    campaignId,
    message,
    contactIds,
    workspaceId,
  }, {
    priority: 1,
    delay: 0, // Immediate execution
  });
  
  return job;
}

// Function to schedule delayed broadcast
export async function scheduleDelayedBroadcast(
  campaignId: string,
  message: string,
  contactIds: string[],
  workspaceId: string,
  delayMs: number
) {
  const job = await broadcastQueue.add('send-broadcast', {
    campaignId,
    message,
    contactIds,
    workspaceId,
  }, {
    delay: delayMs,
  });
  
  return job;
}
