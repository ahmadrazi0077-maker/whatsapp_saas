import { prisma } from '../../shared/lib/prisma';

export class AnalyticsService {
  async getDashboardStats(userId: string) {
    const [
      totalMessages,
      activeContacts,
      connectedDevices,
      broadcasts,
    ] = await Promise.all([
      prisma.message.count({
        where: { chat: { userId } },
      }),
      prisma.contact.count({
        where: { userId },
      }),
      prisma.device.count({
        where: { userId, status: 'connected' },
      }),
      prisma.broadcast.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate delivery rate
    const deliveredMessages = await prisma.message.count({
      where: {
        chat: { userId },
        status: 'delivered',
      },
    });

    const deliveryRate = totalMessages > 0 
      ? ((deliveredMessages / totalMessages) * 100).toFixed(1)
      : '0';

    return {
      totalMessages,
      activeContacts,
      connectedDevices,
      deliveryRate: `${deliveryRate}%`,
      recentBroadcasts: broadcasts,
    };
  }

  async getMessageStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const messages = await prisma.message.findMany({
      where: {
        chat: { userId },
        timestamp: { gte: startDate },
      },
    });

    // Group by date
    const stats = messages.reduce((acc: any, msg) => {
      const date = msg.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { sent: 0, delivered: 0, read: 0 };
      }
      acc[date].sent++;
      if (msg.status === 'delivered') acc[date].delivered++;
      if (msg.status === 'read') acc[date].read++;
      return acc;
    }, {});

    return stats;
  }
}