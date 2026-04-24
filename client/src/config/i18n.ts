import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translations
import enCommon from '../locales/en/common.json';
import enDashboard from '../locales/en/dashboard.json';
import enWhatsapp from '../locales/en/whatsapp.json';
import enPricing from '../locales/en/pricing.json';

import urCommon from '../locales/ur/common.json';
import urDashboard from '../locales/ur/dashboard.json';
import urWhatsapp from '../locales/ur/whatsapp.json';
import urPricing from '../locales/ur/pricing.json';

import arCommon from '../locales/ar/common.json';
import arDashboard from '../locales/ar/dashboard.json';

import esCommon from '../locales/es/common.json';
import esDashboard from '../locales/es/dashboard.json';

import ptCommon from '../locales/pt/common.json';
import ptDashboard from '../locales/pt/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    whatsapp: enWhatsapp,
    pricing: enPricing,
  },
  ur: {
    common: urCommon,
    dashboard: urDashboard,
    whatsapp: urWhatsapp,
    pricing: urPricing,
  },
  ar: {
    common: arCommon,
    dashboard: arDashboard,
    whatsapp: arCommon, // Fallback to common for missing
    pricing: arCommon,
  },
  es: {
    common: esCommon,
    dashboard: esDashboard,
    whatsapp: esCommon,
    pricing: esCommon,
  },
  pt: {
    common: ptCommon,
    dashboard: ptDashboard,
    whatsapp: ptCommon,
    pricing: ptCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    ns: ['common', 'dashboard', 'whatsapp', 'pricing'],
    defaultNS: 'common',
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'path'],
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18n;