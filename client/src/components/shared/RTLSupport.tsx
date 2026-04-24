'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function RTLSupport({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRTL = i18n.language === 'ur' || i18n.language === 'ar' || i18n.language === 'he';
    
    if (isRTL) {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
      
      // Apply RTL styles
      const style = document.createElement('style');
      style.textContent = `
        .rtl {
          direction: rtl;
        }
        .rtl .flex-row {
          flex-direction: row-reverse;
        }
        .rtl .text-left {
          text-align: right;
        }
        .rtl .ml-2 {
          margin-left: 0;
          margin-right: 0.5rem;
        }
        .rtl .mr-2 {
          margin-right: 0;
          margin-left: 0.5rem;
        }
        .rtl .space-x-2 > :not([hidden]) ~ :not([hidden]) {
          --tw-space-x-reverse: 1;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return <>{children}</>;
}