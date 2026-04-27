import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class AutomationController {
  async getRules(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      
      const rules = await prisma.autoReplyRule.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json(rules);
    } catch (error) {
      console.error('Get rules error:', error);
      res.status(500).json({ error: 'Failed to get rules' });
    }
  }
  
  async createRule(req: Request, res: Response) {
    try {
      const { name, keyword, response, matchType, deviceId, isActive, delaySeconds } = req.body;
      const workspaceId = (req as any).workspaceId;
      
      const rule = await prisma.autoReplyRule.create({
        data: {
          name,
          keyword,
          response,
          matchType: matchType || 'CONTAINS',
          isActive: isActive !== false,
          delaySeconds: delaySeconds || 0,
          deviceId,
          workspaceId,
        },
      });
      
      res.json(rule);
    } catch (error) {
      console.error('Create rule error:', error);
      res.status(500).json({ error: 'Failed to create rule' });
    }
  }
  
  async updateRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params;
      const { name, keyword, response, matchType, isActive, delaySeconds } = req.body;
      const workspaceId = (req as any).workspaceId;
      
      await prisma.autoReplyRule.updateMany({
        where: { id: ruleId, workspaceId },
        data: { name, keyword, response, matchType, isActive, delaySeconds },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Update rule error:', error);
      res.status(500).json({ error: 'Failed to update rule' });
    }
  }
  
  async deleteRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params;
      const workspaceId = (req as any).workspaceId;
      
      await prisma.autoReplyRule.deleteMany({
        where: { id: ruleId, workspaceId },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Delete rule error:', error);
      res.status(500).json({ error: 'Failed to delete rule' });
    }
  }
}
