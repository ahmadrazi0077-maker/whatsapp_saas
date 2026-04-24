export const globalConfig = {
  defaultRegion: 'US',
  
  supportedRegions: [
    { code: 'US', name: 'United States', priority: 1 },
    { code: 'GB', name: 'United Kingdom', priority: 2 },
    { code: 'AE', name: 'UAE', priority: 3 },
    { code: 'SA', name: 'Saudi Arabia', priority: 4 },
    { code: 'IN', name: 'India', priority: 5 },
    { code: 'BR', name: 'Brazil', priority: 6 },
  ],
  
  pricing: {
    defaultCurrency: 'USD',
    international: {
      Basic: 29,
      Pro: 99,
      Business: 299,
    },
    localAdjustments: {
      IN: 0.4,    // 60% cheaper for India
      BR: 0.5,    // 50% cheaper for Brazil
      PK: 0.3,    // 70% cheaper for Pakistan
    }
  },
  
  localization: {
    languages: ['en', 'es', 'pt', 'ar', 'ur', 'hi', 'zh'],
    rtlLanguages: ['ar', 'ur', 'he'],
    dateFormats: {
      US: 'MM/DD/YYYY',
      GB: 'DD/MM/YYYY',
      PK: 'DD/MM/YYYY',
    }
  },
  
  compliance: {
    gdpr: { required: true, regions: ['EU', 'UK'] },
    ccpa: { required: true, regions: ['US-CA'] },
    peca: { required: true, regions: ['PK'] },
  }
};