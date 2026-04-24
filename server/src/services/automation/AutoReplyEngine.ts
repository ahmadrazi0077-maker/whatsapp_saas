import { prisma } from '../../prisma/client';

export class AutoReplyEngine {
  async checkAndReply(message: string, deviceId: string, workspaceId: string): Promise<string | null> {
    try {
      // Get active auto-reply rules for this device
      const rules = await prisma.autoReplyRule.findMany({
        where: {
          deviceId,
          workspaceId,
          isActive: true,
        },
      });
      
      // Check each rule
      for (const rule of rules) {
        if (this.matchesRule(message, rule)) {
          // Increment usage count
          await prisma.autoReplyRule.update({
            where: { id: rule.id },
            data: {
              usageCount: { increment: 1 },
              lastUsedAt: new Date(),
            },
          });
          
          return rule.response;
        }
      }
      
      // Check for away message (time-based)
      const awayMessage = await this.checkAwayMessage(deviceId, workspaceId);
      if (awayMessage) {
        return awayMessage;
      }
      
      // Check for greeting (new chats only)
      const greeting = await this.checkGreeting(deviceId, workspaceId);
      if (greeting) {
        return greeting;
      }
      
      return null;
    } catch (error) {
      console.error('Auto-reply check failed:', error);
      return null;
    }
  }
  
  private matchesRule(message: string, rule: any): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerKeyword = rule.keyword.toLowerCase();
    
    switch (rule.matchType) {
      case 'EXACT':
        return lowerMessage === lowerKeyword;
      case 'STARTS_WITH':
        return lowerMessage.startsWith(lowerKeyword);
      case 'ENDS_WITH':
        return lowerMessage.endsWith(lowerKeyword);
      case 'CONTAINS':
      default:
        return lowerMessage.includes(lowerKeyword);
    }
  }
  
  private async checkAwayMessage(deviceId: string, workspaceId: string): Promise<string | null> {
    const awayMessage = await prisma.awayMessage.findFirst({
      where: {
        deviceId,
        workspaceId,
        isActive: true,
      },
    });
    
    if (!awayMessage) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Check if current time is within away hours
    const [startHour, startMinute] = awayMessage.startTime.split(':').map(Number);
    const [endHour, endMinute] = awayMessage.endTime.split(':').map(Number);
    
    const currentTime = currentHour * 60 + now.getMinutes();
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    const isWithinRange = currentTime >= startTime && currentTime <= endTime;
    const isScheduledDay = awayMessage.daysOfWeek.includes(currentDay);
    
    if (isWithinRange && isScheduledDay) {
      return awayMessage.message;
    }
    
    return null;
  }
  
  private async checkGreeting(deviceId: string, workspaceId: string): Promise<string | null> {
    const greeting = await prisma.greetingMessage.findFirst({
      where: {
        deviceId,
        workspaceId,
        isActive: true,
      },
    });
    
    if (!greeting) return null;
    
    // Here you would check if this is a new chat
    // For now, return greeting
    return greeting.message;
  }
  
  async createRule(data: any) {
    return await prisma.autoReplyRule.create({
      data: {
        name: data.name,
        keyword: data.keyword,
        response: data.response,
        matchType: data.matchType,
        deviceId: data.deviceId,
        workspaceId: data.workspaceId,
        isActive: data.isActive ?? true,
        delaySeconds: data.delaySeconds ?? 0,
      },
    });
  }
  
  async updateRule(id: string, data: any) {
    return await prisma.autoReplyRule.update({
      where: { id },
      data,
    });
  }
  
  async deleteRule(id: string) {
    return await prisma.autoReplyRule.delete({
      where: { id },
    });
  }
  
  async getRules(deviceId: string, workspaceId: string) {
    return await prisma.autoReplyRule.findMany({
      where: {
        deviceId,
        workspaceId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}