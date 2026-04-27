import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class BroadcastController {
  async createCampaign(req: Request, res: Response) {
    try {
      const { name, message, contacts, listId, scheduledFor } = req.body;
      const workspaceId = (req as any).workspaceId;
      const userId = (req as any).userId;
      
      // Get device for workspace
      const device = await prisma.device.findFirst({
        where: { workspaceId, status: 'CONNECTED' },
      });
      
      if (!device) {
        return res.status(400).json({ error: 'No connected device found' });
      }
      
      const campaign = await prisma.broadcastCampaign.create({
        data: {
          name: name || `Broadcast ${Date.now()}`,
          message,
          status: scheduledFor ? 'SCHEDULED' : 'DRAFT',
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          totalRecipients: contacts?.length || 0,
          workspaceId,
          deviceId: device.id,
        },
      });
      
      // If sending immediately, process the broadcast
      if (!scheduledFor && contacts?.length) {
        // TODO: Queue broadcast job
        await prisma.broadcastCampaign.update({
          where: { id: campaign.id },
          data: { status: 'SENDING' },
        });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error('Create campaign error:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  }
  
  async getCampaigns(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      
      const campaigns = await prisma.broadcastCampaign.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json(campaigns);
    } catch (error) {
      console.error('Get campaigns error:', error);
      res.status(500).json({ error: 'Failed to get campaigns' });
    }
  }
  
  async cancelCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const workspaceId = (req as any).workspaceId;
      
      await prisma.broadcastCampaign.updateMany({
        where: { id: campaignId, workspaceId, status: 'SCHEDULED' },
        data: { status: 'CANCELLED' },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Cancel campaign error:', error);
      res.status(500).json({ error: 'Failed to cancel campaign' });
    }
  }
}
