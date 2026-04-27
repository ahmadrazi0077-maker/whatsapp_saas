import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class AnalyticsController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      
      const [totalMessages, totalContacts, activeChats, devices] = await Promise.all([
        prisma.message.count({ where: { conversation: { device: { workspaceId } } } }),
        prisma.contact.count({ where: { workspaceId } }),
        prisma.conversation.count({ where: { device: { workspaceId }, status: 'ACTIVE' } }),
        prisma.device.count({ where: { workspaceId, status: 'CONNECTED' } }),
      ]);
      
      // Get last 7 days message volume
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const dailyMessages = await prisma.$queryRaw`
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM messages
        WHERE conversation_id IN (
          SELECT id FROM conversations WHERE device_id IN (
            SELECT id FROM devices WHERE workspace_id = ${workspaceId}
          )
        )
        AND timestamp >= ${sevenDaysAgo}
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `;
      
      res.json({
        stats: {
          totalMessages,
          totalContacts,
          activeChats,
          devices,
          responseRate: 94,
          avgResponseTime: 45,
          satisfactionRate: 98,
        },
        chartData: dailyMessages,
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
  }
}
