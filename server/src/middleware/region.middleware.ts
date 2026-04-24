import { Request, Response, NextFunction } from 'express';
import geoip from 'geoip-lite';
import { regions } from '../config/regions';

// Region configuration mapping
const regionConfigs: Record<string, any> = {
  PK: require('../config/regions/pakistan.config').pakistanConfig,
  US: require('../config/regions/global.config').globalConfig,
  AE: require('../config/regions/uae.config').uaeConfig,
  IN: require('../config/regions/india.config').indiaConfig,
  BR: require('../config/regions/brazil.config').brazilConfig,
};

declare global {
  namespace Express {
    interface Request {
      region: any;
      locale: string;
      currency: string;
    }
  }
}

export async function detectRegion(req: Request, res: Response, next: NextFunction) {
  // Get IP address
  let ip = req.headers['x-forwarded-for'] as string || 
           req.socket.remoteAddress || 
           '127.0.0.1';
  
  // Handle localhost
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '8.8.8.8'; // Default to US for local development
  }
  
  // Remove IPv6 prefix if present
  ip = ip.replace(/^::ffff:/, '');
  
  // Geo lookup
  const geo = geoip.lookup(ip);
  
  let regionCode = 'PK'; // Default to Pakistan
  
  if (geo) {
    const countryMap: Record<string, string> = {
      'PK': 'PK', 'IN': 'IN', 'AE': 'AE', 
      'SA': 'SA', 'US': 'US', 'GB': 'GB',
      'CA': 'US', 'AU': 'GB', 'BR': 'BR',
    };
    regionCode = countryMap[geo.country] || 'US';
  }
  
  // Check if user has saved preference
  if (req.headers.authorization) {
    try {
      // Verify JWT and get user preferences
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token); // Implement your verify function
      
      if (decoded && decoded.userId) {
        const userPrefs = await prisma.userPreference.findUnique({
          where: { userId: decoded.userId },
          include: { region: true }
        });
        
        if (userPrefs && userPrefs.region) {
          regionCode = userPrefs.region.code;
        }
      }
    } catch (error) {
      console.error('Failed to get user preferences:', error);
    }
  }
  
  // Get region configuration
  const regionConfig = regionConfigs[regionCode] || regionConfigs.PK;
  
  // Attach region info to request
  req.region = {
    code: regionCode,
    config: regionConfig,
    timezone: regionConfig?.region.timezone || 'Asia/Karachi',
  };
  
  req.locale = regionConfig?.region.language || 'en';
  req.currency = regionConfig?.region.currency || 'PKR';
  
  // Set headers for client
  res.setHeader('X-Region', regionCode);
  res.setHeader('X-Locale', req.locale);
  res.setHeader('X-Currency', req.currency);
  
  next();
}

// Helper function to verify JWT (implement based on your auth system)
function verifyToken(token: string): any {
  // Implement your JWT verification logic
  // This is a placeholder
  return null;
}