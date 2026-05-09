import { Response } from 'express';
import { BroadcastService } from './broadcast.service';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../shared/lib/response';

const broadcastService = new BroadcastService();

export class BroadcastController {
  async getAllBroadcasts(req: AuthRequest, res: Response) {
    try {
      const broadcasts = await broadcastService.getAllBroadcasts(req.userId!);
      return sendSuccess(res, broadcasts);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async createBroadcast(req: AuthRequest, res: Response) {
    try {
      const broadcast = await broadcastService.createBroadcast(req.userId!, req.body);
      return sendSuccess(res, broadcast, 201);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async sendBroadcast(req: AuthRequest, res: Response) {
    try {
      const result = await broadcastService.sendBroadcast(req.params.id, req.userId!);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async scheduleBroadcast(req: AuthRequest, res: Response) {
    try {
      const { scheduledAt } = req.body;
      const broadcast = await broadcastService.scheduleBroadcast(
        req.params.id,
        req.userId!,
        new Date(scheduledAt)
      );
      return sendSuccess(res, broadcast);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}