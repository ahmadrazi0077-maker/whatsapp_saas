'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<Language | null>(null);

  useEffect(() => {
    const langCode = i18n.language;
    const lang = languages.find(l => l.code === langCode) || languages[0];
    setCurrentLang(lang);
    
    // Set RTL/LTR direction
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = langCode;
  }, [i18n.language]);

  const changeLanguage = async (lang: Language) => {
    await i18n.changeLanguage(lang.code);
    setCurrentLang(lang);
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
    
    // Save to localStorage
    localStorage.setItem('preferred-language', lang.code);
    
    // Send to backend
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang.code, rtl: lang.dir === 'rtl' }),
      });
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  if (!currentLang) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        <span className="text-xl">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((lang) => (
              <Menu.Item key={lang.code}>
                {({ active }) => (
                  <button
                    onClick={() => changeLanguage(lang)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 ${
                      i18n.language === lang.code ? 'bg-blue-50 font-semibold' : ''
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.nativeName}</span>
                    {i18n.language === lang.code && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}