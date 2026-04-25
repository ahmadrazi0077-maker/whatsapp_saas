'use client';

import React, { useEffect } from 'react';
import i18n from '@/config/i18n';
import { I18nextProvider } from 'react-i18next';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
    
    // Detect region from backend
    fetch('/api/region/detect')
      .then(res => res.json())
      .then(data => {
        if (data.language && data.language !== i18n.language) {
          i18n.changeLanguage(data.language);
        }
      })
      .catch(console.error);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
