export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  enabled: boolean;
  regionCodes: string[];
}

export const languages: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    enabled: true,
    regionCodes: ['US', 'GB', 'AU', 'CA'],
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    rtl: true,
    enabled: true,
    regionCodes: ['PK'],
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    enabled: true,
    regionCodes: ['AE', 'SA', 'EG', 'KW'],
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    enabled: true,
    regionCodes: ['ES', 'MX', 'AR', 'CO'],
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    enabled: true,
    regionCodes: ['BR', 'PT'],
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false,
    enabled: true,
    regionCodes: ['IN'],
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    enabled: true,
    regionCodes: ['CN', 'SG', 'TW'],
  },
];

export function getLanguageByCode(code: string): LanguageConfig | undefined {
  return languages.find(lang => lang.code === code);
}

export function getLanguageByRegion(regionCode: string): LanguageConfig | undefined {
  return languages.find(lang => lang.regionCodes.includes(regionCode));
}