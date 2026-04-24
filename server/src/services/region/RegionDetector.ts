import axios from 'axios';
import geoip from 'geoip-lite';

export class RegionDetector {
  async detectByIP(ipAddress: string) {
    try {
      // Remove IPv6 prefix
      ipAddress = ipAddress.replace(/^::ffff:/, '');
      
      const geo = geoip.lookup(ipAddress);
      
      if (!geo) {
        return this.getDefaultRegion();
      }
      
      const regionMap: Record<string, any> = {
        PK: { code: 'PK', name: 'Pakistan', currency: 'PKR', language: 'ur', multiplier: 0.3 },
        IN: { code: 'IN', name: 'India', currency: 'INR', language: 'hi', multiplier: 0.4 },
        AE: { code: 'AE', name: 'UAE', currency: 'AED', language: 'ar', multiplier: 3.67 },
        SA: { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', language: 'ar', multiplier: 3.75 },
        US: { code: 'US', name: 'United States', currency: 'USD', language: 'en', multiplier: 1.0 },
        GB: { code: 'GB', name: 'United Kingdom', currency: 'GBP', language: 'en', multiplier: 0.9 },
        BR: { code: 'BR', name: 'Brazil', currency: 'BRL', language: 'pt', multiplier: 0.5 },
      };
      
      const region = regionMap[geo.country];
      if (region) {
        return region;
      }
      
      return this.getDefaultRegion();
    } catch (error) {
      console.error('Region detection failed:', error);
      return this.getDefaultRegion();
    }
  }
  
  async detectByBrowser(navigator: any) {
    const language = navigator.language || navigator.userLanguage;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map timezone to region
    const timezoneMap: Record<string, string> = {
      'Asia/Karachi': 'PK',
      'Asia/Dubai': 'AE',
      'Asia/Riyadh': 'SA',
      'Asia/Kolkata': 'IN',
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'Europe/London': 'GB',
      'America/Sao_Paulo': 'BR',
    };
    
    let regionCode = timezoneMap[timezone] || 'PK';
    
    // Cross-check with language
    if (language && language.includes('ur')) regionCode = 'PK';
    if (language && language.includes('ar')) regionCode = 'AE';
    if (language && language.includes('hi')) regionCode = 'IN';
    
    return this.getRegionByCode(regionCode);
  }
  
  async detectByGPS(latitude: number, longitude: number) {
    try {
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      const countryCode = response.data.countryCode;
      return this.getRegionByCode(countryCode);
    } catch (error) {
      console.error('GPS detection failed:', error);
      return this.getDefaultRegion();
    }
  }
  
  private getRegionByCode(code: string) {
    const regions: Record<string, any> = {
      PK: { code: 'PK', name: 'Pakistan', currency: 'PKR', language: 'ur', multiplier: 0.3 },
      IN: { code: 'IN', name: 'India', currency: 'INR', language: 'hi', multiplier: 0.4 },
      AE: { code: 'AE', name: 'UAE', currency: 'AED', language: 'ar', multiplier: 3.67 },
      US: { code: 'US', name: 'United States', currency: 'USD', language: 'en', multiplier: 1.0 },
    };
    
    return regions[code] || this.getDefaultRegion();
  }
  
  private getDefaultRegion() {
    return {
      code: 'PK',
      name: 'Pakistan',
      currency: 'PKR',
      language: 'ur',
      multiplier: 0.3,
    };
  }
}