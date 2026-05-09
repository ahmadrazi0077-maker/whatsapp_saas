import { prisma } from '../../shared/lib/prisma';
import { redis } from '../../shared/lib/redis';

export class BroadcastService {
  async getAllBroadcasts(userId: string) {
    return prisma.broadcast.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBroadcast(userId: string, data: any) {
    return prisma.broadcast.create({
      data: {
        name: data.name,
        message: data.message,
        recipients: data.recipients,
        status: 'draft',
        stats: {
          total: data.recipients.length,
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
        },
        userId,
      },
    });
  }

  async sendBroadcast(broadcastId: string, userId: string) {
    const broadcast = await prisma.broadcast.findFirst({
      where: { id: broadcastId, userId },
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    // Update status to sending
    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'sending',
        sentAt: new Date(),
      },
    });

    // Add to queue for processing
    await redis.lpush('broadcast:queue', JSON.stringify({
      broadcastId,
      userId,
      message: broadcast.message,
      recipients: broadcast.recipients,
    }));

    return { message: 'Broadcast queued for sending' };
  }

  async scheduleBroadcast(broadcastId: string, userId: string, scheduledAt: Date) {
    const broadcast = await prisma.broadcast.findFirst({
      where: { id: broadcastId, userId },
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    return prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'scheduled',
        scheduledAt,
      },
    });
  }
}