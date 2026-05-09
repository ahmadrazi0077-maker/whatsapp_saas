import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../shared/lib/response';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const stats = await analyticsService.getDashboardStats(req.userId!);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async getMessageStats(req: AuthRequest, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const stats = await analyticsService.getMessageStats(req.userId!, days);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}