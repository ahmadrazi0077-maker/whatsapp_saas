import { prisma } from '../../shared/lib/prisma';

export class ContactsService {
  async getAllContacts(userId: string) {
    return prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createContact(userId: string, data: any) {
    return prisma.contact.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateContact(contactId: string, userId: string, data: any) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return prisma.contact.update({
      where: { id: contactId },
      data,
    });
  }

  async deleteContact(contactId: string, userId: string) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return prisma.contact.delete({
      where: { id: contactId },
    });
  }
}