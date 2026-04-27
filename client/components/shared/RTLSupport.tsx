'use client';

import React, { useEffect } from 'react';

export default function RTLSupport({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Simple RTL detection based on language
    const htmlLang = document.documentElement.lang;
    const isRTL = htmlLang === 'ar' || htmlLang === 'ur' || htmlLang === 'he';
    
    if (isRTL) {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  }, []);

  return <>{children}</>;
}
