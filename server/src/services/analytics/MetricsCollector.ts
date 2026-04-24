import { prisma } from '../../prisma/client';

export class MetricsCollector {
  async collectDailyMetrics(workspaceId: string, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Collect metrics
    const [messagesSent, messagesReceived, newContacts, activeConversations] = await Promise.all([
      prisma.message.count({
        where: {
          workspaceId,
          fromMe: true,
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.message.count({
        where: {
          workspaceId,
          fromMe: false,
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.contact.count({
        where: {
          workspaceId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.conversation.count({
        where: {
          workspaceId,
          status: 'ACTIVE',
          updatedAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);
    
    // Save metrics
    await prisma.metric.upsert({
      where: {
        workspaceId_metricType_date: {
          workspaceId,
          metricType: 'DAILY',
          date: startOfDay,
        },
      },
      update: {
        messagesSent,
        messagesReceived,
        newContacts,
        activeConversations,
      },
      create: {
        workspaceId,
        metricType: 'DAILY',
        date: startOfDay,
        messagesSent,
        messagesReceived,
        newContacts,
        activeConversations,
      },
    });
    
    return {
      messagesSent,
      messagesReceived,
      newContacts,
      activeConversations,
    };
  }
  
  async getDashboardStats(workspaceId: string) {
    const [totalMessages, totalContacts, activeChats, responseTime] = await Promise.all([
      prisma.message.count({ where: { workspaceId } }),
      prisma.contact.count({ where: { workspaceId } }),
      prisma.conversation.count({ where: { workspaceId, status: 'ACTIVE' } }),
      this.calculateAverageResponseTime(workspaceId),
    ]);
    
    return {
      totalMessages,
      totalContacts,
      activeChats,
      avgResponseTime: responseTime,
    };
  }
  
  private async calculateAverageResponseTime(workspaceId: string): Promise<number> {
    const messages = await prisma.message.findMany({
      where: {
        workspaceId,
        fromMe: false,
        status: 'READ',
      },
      take: 1000,
      orderBy: { timestamp: 'desc' },
    });
    
    if (messages.length === 0) return 0;
    
    let totalResponseTime = 0;
    let count = 0;
    
    for (const message of messages) {
      const previousMessage = await prisma.message.findFirst({
        where: {
          conversationId: message.conversationId,
          fromMe: true,
          timestamp: { lt: message.timestamp },
        },
        orderBy: { timestamp: 'desc' },
      });
      
      if (previousMessage && message.timestamp && previousMessage.timestamp) {
        const responseTime = message.timestamp.getTime() - previousMessage.timestamp.getTime();
        totalResponseTime += responseTime;
        count++;
      }
    }
    
    return count > 0 ? totalResponseTime / count / 1000 : 0;
  }
  
  async generateReport(workspaceId: string, startDate: Date, endDate: Date) {
    const metrics = await prisma.metric.findMany({
      where: {
        workspaceId,
        metricType: 'DAILY',
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
    
    return {
      period: { startDate, endDate },
      metrics,
      summary: {
        totalMessages: metrics.reduce((sum, m) => sum + m.messagesSent + m.messagesReceived, 0),
        totalNewContacts: metrics.reduce((sum, m) => sum + m.newContacts, 0),
        averageActiveChats: metrics.reduce((sum, m) => sum + m.activeConversations, 0) / metrics.length,
      },
    };
  }
}