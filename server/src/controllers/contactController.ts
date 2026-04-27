import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ContactController {
  async getContacts(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      
      const contacts = await prisma.contact.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Failed to get contacts' });
    }
  }
  
  async getContact(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = (req as any).workspaceId;
      
      const contact = await prisma.contact.findFirst({
        where: { id, workspaceId },
      });
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      res.json(contact);
    } catch (error) {
      console.error('Get contact error:', error);
      res.status(500).json({ error: 'Failed to get contact' });
    }
  }
  
  async createContact(req: Request, res: Response) {
    try {
      const { phoneNumber, name, email, tags } = req.body;
      const workspaceId = (req as any).workspaceId;
      
      const contact = await prisma.contact.create({
        data: {
          phoneNumber,
          name,
          email,
          tags: tags || [],
          workspaceId,
        },
      });
      
      res.json(contact);
    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({ error: 'Failed to create contact' });
    }
  }
  
  async updateContact(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, tags } = req.body;
      const workspaceId = (req as any).workspaceId;
      
      const contact = await prisma.contact.updateMany({
        where: { id, workspaceId },
        data: { name, email, tags },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ error: 'Failed to update contact' });
    }
  }
  
  async deleteContact(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = (req as any).workspaceId;
      
      await prisma.contact.deleteMany({
        where: { id, workspaceId },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  }
  
  async bulkDelete(req: Request, res: Response) {
    try {
      const { ids } = req.body;
      const workspaceId = (req as any).workspaceId;
      
      await prisma.contact.deleteMany({
        where: { id: { in: ids }, workspaceId },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({ error: 'Failed to delete contacts' });
    }
  }
  
  async importContacts(req: Request, res: Response) {
    try {
      const { contacts } = req.body;
      const workspaceId = (req as any).workspaceId;
      
      const createdContacts = await prisma.$transaction(
        contacts.map((contact: any) =>
          prisma.contact.upsert({
            where: { phoneNumber_workspaceId: {
              phoneNumber: contact.phoneNumber,
              workspaceId,
            }},
            update: { name: contact.name, email: contact.email },
            create: {
              phoneNumber: contact.phoneNumber,
              name: contact.name,
              email: contact.email,
              tags: contact.tags || [],
              workspaceId,
            },
          })
        )
      );
      
      res.json({ contacts: createdContacts, count: createdContacts.length });
    } catch (error) {
      console.error('Import contacts error:', error);
      res.status(500).json({ error: 'Failed to import contacts' });
    }
  }
}
