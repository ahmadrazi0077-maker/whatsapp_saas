import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple i18n configuration for now
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: {
          "app.name": "WhatsApp SaaS",
          "nav.dashboard": "Dashboard",
          "nav.chats": "Chats",
          "nav.broadcast": "Broadcast",
          "actions.save": "Save",
          "actions.cancel": "Cancel",
          "actions.delete": "Delete",
          "actions.send": "Send"
        }
      },
      ur: {
        common: {
          "app.name": "واٹس ایپ ساس",
          "nav.dashboard": "ڈیش بورڈ",
          "nav.chats": "چیٹس",
          "nav.broadcast": "براڈکاسٹ",
          "actions.save": "محفوظ کریں",
          "actions.cancel": "منسوخ کریں",
          "actions.delete": "حذف کریں",
          "actions.send": "بھیجیں"
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
