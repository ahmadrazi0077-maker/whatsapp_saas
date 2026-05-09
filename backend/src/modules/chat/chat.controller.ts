import { Response } from 'express';
import { ChatService } from './chat.service';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../shared/lib/response';

const chatService = new ChatService();

export class ChatController {
  async getAllChats(req: AuthRequest, res: Response) {
    try {
      const chats = await chatService.getAllChats(req.userId!);
      return sendSuccess(res, chats);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async getChatById(req: AuthRequest, res: Response) {
    try {
      const chat = await chatService.getChatById(req.params.id, req.userId!);
      return sendSuccess(res, chat);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { message, type } = req.body;
      const chatMessage = await chatService.sendMessage(req.params.id, req.userId!, message, type);
      return sendSuccess(res, chatMessage, 201);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async createChat(req: AuthRequest, res: Response) {
    try {
      const chat = await chatService.createChat(req.userId!, req.body);
      return sendSuccess(res, chat, 201);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}