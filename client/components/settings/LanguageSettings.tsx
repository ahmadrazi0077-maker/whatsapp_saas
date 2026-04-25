'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
];

export default function LanguageSettings() {
  const [selectedLang, setSelectedLang] = useState('en');

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLang(langCode);
    // API call will go here
    toast.success('Language changed successfully');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Language Settings</h2>
      <div className="space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition ${
              selectedLang === lang.code ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left">
                <p className="font-medium">{lang.name}</p>
                <p className="text-sm text-gray-500">{lang.native}</p>
              </div>
            </div>
            {selectedLang === lang.code && (
              <span className="text-blue-600">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
