import { Response } from 'express';
import { ContactsService } from './contacts.service';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../shared/lib/response';

const contactsService = new ContactsService();

export class ContactsController {
  async getAllContacts(req: AuthRequest, res: Response) {
    try {
      const contacts = await contactsService.getAllContacts(req.userId!);
      return sendSuccess(res, contacts);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async createContact(req: AuthRequest, res: Response) {
    try {
      const contact = await contactsService.createContact(req.userId!, req.body);
      return sendSuccess(res, contact, 201);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async updateContact(req: AuthRequest, res: Response) {
    try {
      const contact = await contactsService.updateContact(req.params.id, req.userId!, req.body);
      return sendSuccess(res, contact);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async deleteContact(req: AuthRequest, res: Response) {
    try {
      await contactsService.deleteContact(req.params.id, req.userId!);
      return sendSuccess(res, { message: 'Contact deleted successfully' });
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}