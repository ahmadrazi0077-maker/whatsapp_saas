export interface RegionConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
  rtl: boolean;
  phoneCode: string;
  dateFormat: string;
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday
  decimalSeparator: string;
  thousandsSeparator: string;
  priceMultiplier: number;
}

export const regions: Record<string, RegionConfig> = {
  PK: {
    code: 'PK',
    name: 'Pakistan',
    currency: 'PKR',
    currencySymbol: '₨',
    timezone: 'Asia/Karachi',
    language: 'ur',
    rtl: false,
    phoneCode: '+92',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 1,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    priceMultiplier: 0.3,
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/New_York',
    language: 'en',
    rtl: false,
    phoneCode: '+1',
    dateFormat: 'MM/DD/YYYY',
    firstDayOfWeek: 0,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    priceMultiplier: 1.0,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    timezone: 'Europe/London',
    language: 'en',
    rtl: false,
    phoneCode: '+44',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 1,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    priceMultiplier: 0.9,
  },
  AE: {
    code: 'AE',
    name: 'UAE',
    currency: 'AED',
    currencySymbol: 'د.إ',
    timezone: 'Asia/Dubai',
    language: 'ar',
    rtl: true,
    phoneCode: '+971',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 1,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    priceMultiplier: 3.67, // 1 USD = 3.67 AED
  },
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    currencySymbol: '﷼',
    timezone: 'Asia/Riyadh',
    language: 'ar',
    rtl: true,
    phoneCode: '+966',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 1,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    priceMultiplier: 3.75,
  },
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    language: 'hi',
    rtl: false,
    phoneCode: '+91',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 1,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    priceMultiplier: 0.4,
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    currencySymbol: 'R$',
    timezone: 'America/Sao_Paulo',
    language: 'pt',
    rtl: false,
    phoneCode: '+55',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 0,
    decimalSeparator: ',',
    thousandsSeparator: '.',
    priceMultiplier: 0.5,
  },
};

export function getRegionConfig(regionCode: string): RegionConfig {
  return regions[regionCode] || regions.US;
}

export function formatPrice(amount: number, regionCode: string): string {
  const region = getRegionConfig(regionCode);
  const convertedAmount = amount * region.priceMultiplier;
  
  return `${region.currencySymbol} ${convertedAmount.toFixed(2)}`;
}