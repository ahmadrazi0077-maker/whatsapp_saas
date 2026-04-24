'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BroadcastForm from '@/components/broadcast/BroadcastForm';
import BroadcastList from '@/components/broadcast/BroadcastList';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function BroadcastPage() {
  const { t } = useTranslation(['common']);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { name: t('broadcast:create_new'), component: <BroadcastForm onSuccess={() => setRefreshKey(prev => prev + 1)} /> },
    { name: t('broadcast:my_campaigns'), component: <BroadcastList key={refreshKey} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('broadcast:title')}</h1>
        <p className="text-gray-600 mt-1">{t('broadcast:description')}</p>
      </div>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab, idx) => (
            <Tab.Panel key={idx}>{tab.component}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}