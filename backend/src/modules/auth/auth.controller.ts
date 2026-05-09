import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../shared/lib/response';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      return sendSuccess(res, result, 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 401);
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.me(req.userId!);
      return sendSuccess(res, user);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}