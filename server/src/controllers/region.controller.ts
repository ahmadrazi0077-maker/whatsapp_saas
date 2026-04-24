import { Request, Response } from 'express';
import { RegionDetector } from '../services/region/RegionDetector';
import { DynamicPricingService } from '../services/pricing/DynamicPricingService';
import { prisma } from '../prisma/client';

export class RegionController {
  private regionDetector: RegionDetector;
  private pricingService: DynamicPricingService;

  constructor() {
    this.regionDetector = new RegionDetector();
    this.pricingService = new DynamicPricingService();
  }

  detectRegion = async (req: Request, res: Response) => {
    try {
      const ip = req.headers['x-forwarded-for'] as string || 
                 req.socket.remoteAddress || 
                 '127.0.0.1';
      
      const region = await this.regionDetector.detectByIP(ip);
      
      // Get browser language from headers
      const acceptLanguage = req.headers['accept-language'];
      let language = region.language;
      
      if (acceptLanguage) {
        const preferredLang = acceptLanguage.split(',')[0].split('-')[0];
        if (['en', 'ur', 'ar', 'es', 'pt', 'hi'].includes(preferredLang)) {
          language = preferredLang;
        }
      }
      
      res.json({
        regionCode: region.code,
        regionName: region.name,
        currency: region.currency,
        currencySymbol: region.currencySymbol,
        language: language,
        timezone: region.timezone,
        priceMultiplier: region.multiplier,
        rtl: region.code === 'AE' || region.code === 'SA' || language === 'ur',
        phoneCode: region.phoneCode,
      });
    } catch (error) {
      console.error('Region detection error:', error);
      res.status(500).json({ error: 'Failed to detect region' });
    }
  };

  getAllRegions = async (req: Request, res: Response) => {
    try {
      const regions = await prisma.region.findMany({
        where: { isActive: true },
        include: {
          pricingTiers: {
            include: { plan: true }
          }
        }
      });
      
      res.json(regions);
    } catch (error) {
      console.error('Get regions error:', error);
      res.status(500).json({ error: 'Failed to fetch regions' });
    }
  };

  getRegionByCode = async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const region = await prisma.region.findUnique({
        where: { code },
        include: {
          pricingTiers: {
            include: { plan: true }
          }
        }
      });
      
      if (!region) {
        return res.status(404).json({ error: 'Region not found' });
      }
      
      res.json(region);
    } catch (error) {
      console.error('Get region error:', error);
      res.status(500).json({ error: 'Failed to fetch region' });
    }
  };

  setUserRegionPreference = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { regionCode } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const region = await prisma.region.findUnique({
        where: { code: regionCode }
      });
      
      if (!region) {
        return res.status(404).json({ error: 'Region not found' });
      }
      
      // Update or create user region preference
      await prisma.userRegion.upsert({
        where: { userId_regional: { userId, regional: true } },
        update: { regionId: region.id, isSelected: true },
        create: {
          userId,
          regionId: region.id,
          isSelected: true,
          detectedAt: new Date()
        }
      });
      
      // Update user's currency and language
      await prisma.user.update({
        where: { id: userId },
        data: {
          preferredCurrency: region.currency,
          preferredLanguage: region.language
        }
      });
      
      res.json({ success: true, region });
    } catch (error) {
      console.error('Set region preference error:', error);
      res.status(500).json({ error: 'Failed to set region preference' });
    }
  };

  getUserRegionPreference = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userRegion = await prisma.userRegion.findFirst({
        where: { userId, isSelected: true },
        include: { region: true }
      });
      
      res.json(userRegion?.region || null);
    } catch (error) {
      console.error('Get region preference error:', error);
      res.status(500).json({ error: 'Failed to get region preference' });
    }
  };

  getRegionalPricing = async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const regionCode = req.query.region as string || 'PK';
      
      const pricing = await this.pricingService.getPriceForRegion(planId, regionCode);
      
      res.json(pricing);
    } catch (error) {
      console.error('Get regional pricing error:', error);
      res.status(500).json({ error: 'Failed to get pricing' });
    }
  };
}