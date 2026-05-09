import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

interface AutoReplyRule {
  id: string;
  keyword: string;
  replyMessage: string;
  matchType: 'exact' | 'contains' | 'startsWith';
  isActive: boolean;
}

const DEFAULT_RULES: AutoReplyRule[] = [
  {
    id: 'price',
    keyword: 'price',
    replyMessage: '📊 *Pricing Plans*\n\n🚀 Starter: $29/month\n💼 Professional: $79/month\n🏢 Enterprise: $199/month\n\nVisit our website for a free trial!',
    matchType: 'contains',
    isActive: true,
  },
  {
    id: 'help',
    keyword: 'help',
    replyMessage: '🤖 *How can I help?*\n\nYou can ask about:\n• 💰 Pricing\n• ⚡ Features\n• 📞 Support\n• 🎮 Demo',
    matchType: 'contains',
    isActive: true,
  },
  {
    id: 'hello',
    keyword: 'hello',
    replyMessage: 'Hello! 👋 Welcome to *WhatsFlow*!\n\nHow can I assist you today?',
    matchType: 'startsWith',
    isActive: true,
  },
  {
    id: 'hi',
    keyword: 'hi',
    replyMessage: 'Hi there! 👋 Welcome to *WhatsFlow*!\n\nType *help* to see what I can do.',
    matchType: 'startsWith',
    isActive: true,
  },
  {
    id: 'demo',
    keyword: 'demo',
    replyMessage: "🎮 *Schedule a Demo*\n\nWe'd love to show you around! Reply with your preferred time and we'll schedule a demo for you.",
    matchType: 'contains',
    isActive: true,
  },
  {
    id: 'support',
    keyword: 'support',
    replyMessage: '📞 *Support*\n\nOur team is available 24/7. You can also email us at support@whatsflow.com',
    matchType: 'contains',
    isActive: true,
  },
];

export async function processAutoReply(
  userId: string,
  phoneNumber: string,
  message: string,
  sessionManager: any,
  deviceId: string
): Promise<void> {
  try {
    const lowerMessage = message.toLowerCase().trim();
    const allRules = DEFAULT_RULES;

    for (const rule of allRules) {
      if (!rule.isActive) continue;

      let isMatch = false;
      switch (rule.matchType) {
        case 'exact':
          isMatch = lowerMessage === rule.keyword.toLowerCase();
          break;
        case 'contains':
          isMatch = lowerMessage.includes(rule.keyword.toLowerCase());
          break;
        case 'startsWith':
          isMatch = lowerMessage.startsWith(rule.keyword.toLowerCase());
          break;
      }

      if (isMatch) {
        logger.info(`Auto-reply rule "${rule.id}" matched for ${phoneNumber}`);
        
        // Add small delay to feel natural
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Send auto-reply via session manager
        await sessionManager.sendMessage(deviceId, phoneNumber, rule.replyMessage);
        
        break;
      }
    }
  } catch (error) {
    logger.error('Error processing auto-reply:', error);
  }
}