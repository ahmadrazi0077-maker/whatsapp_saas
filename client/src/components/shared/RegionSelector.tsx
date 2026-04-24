'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { GlobeAltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Region {
  code: string;
  name: string;
  flag: string;
  currency: string;
  language: string;
  isDefault?: boolean;
}

const regions: Region[] = [
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', language: 'Urdu', isDefault: true },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', language: 'English' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', language: 'English' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', language: 'Arabic' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', language: 'Arabic' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', language: 'Hindi' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', language: 'Portuguese' },
];

export default function RegionSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  useEffect(() => {
    // Check if region is already selected
    const savedRegion = localStorage.getItem('selected-region');
    if (savedRegion) {
      const region = regions.find(r => r.code === savedRegion);
      if (region) setSelectedRegion(region);
      else detectRegion();
    } else {
      detectRegion();
    }
  }, []);

  const detectRegion = async () => {
    try {
      const response = await fetch('/api/region/detect');
      const data = await response.json();
      const region = regions.find(r => r.code === data.regionCode) || regions[0];
      setSelectedRegion(region);
      localStorage.setItem('selected-region', region.code);
    } catch (error) {
      console.error('Region detection failed:', error);
      setSelectedRegion(regions[0]);
    }
  };

  const selectRegion = async (region: Region) => {
    setSelectedRegion(region);
    localStorage.setItem('selected-region', region.code);
    setIsOpen(false);
    
    // Update language based on region
    const languageMap: Record<string, string> = {
      'PK': 'ur', 'US': 'en', 'GB': 'en', 'AE': 'ar', 'SA': 'ar', 'IN': 'hi', 'BR': 'pt'
    };
    
    const language = languageMap[region.code] || 'en';
    
    // Trigger language change event
    window.dispatchEvent(new CustomEvent('regionChange', { 
      detail: { region, language, currency: region.currency }
    }));
    
    // Reload to apply changes
    window.location.reload();
  };

  if (!selectedRegion) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="hidden sm:inline">{selectedRegion.flag} {selectedRegion.name}</span>
        <span className="sm:hidden">{selectedRegion.flag}</span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Select Your Region
                  </Dialog.Title>
                  
                  <div className="mt-4 space-y-2">
                    {regions.map((region) => (
                      <button
                        key={region.code}
                        onClick={() => selectRegion(region)}
                        className={`w-full flex items-center justify-between rounded-lg border p-4 transition-all ${
                          selectedRegion.code === region.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{region.flag}</span>
                          <div className="text-left">
                            <p className="font-semibold">{region.name}</p>
                            <p className="text-sm text-gray-500">
                              {region.currency} • {region.language}
                            </p>
                          </div>
                        </div>
                        {selectedRegion.code === region.code && (
                          <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}