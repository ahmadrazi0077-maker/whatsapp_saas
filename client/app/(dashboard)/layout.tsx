'use client';

import { useState } from 'react';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import CurrencySelector from '@/components/shared/CurrencySelector';
import RegionSelector from '@/components/shared/RegionSelector';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">WhatsApp SaaS</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <RegionSelector />
              <CurrencySelector />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
}