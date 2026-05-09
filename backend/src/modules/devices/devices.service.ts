import { prisma } from '../../shared/lib/prisma';

export class DevicesService {
  async getAllDevices(userId: string) {
    return prisma.device.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeviceById(deviceId: string, userId: string) {
    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    return device;
  }

  async connectDevice(userId: string, data: { name: string; phoneNumber: string }) {
    return prisma.device.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        status: 'connecting',
        userId,
      },
    });
  }

  async disconnectDevice(deviceId: string, userId: string) {
    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    return prisma.device.update({
      where: { id: deviceId },
      data: {
        status: 'disconnected',
        battery: null,
      },
    });
  }

  async updateDeviceStatus(deviceId: string, userId: string, status: string, battery?: number) {
    return prisma.device.updateMany({
      where: { id: deviceId, userId },
      data: {
        status,
        battery,
        lastSeen: new Date(),
      },
    });
  }
}