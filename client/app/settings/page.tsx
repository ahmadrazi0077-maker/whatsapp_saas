'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserCircleIcon, 
  DevicePhoneMobileIcon, 
  BellIcon, 
  KeyIcon,
  CreditCardIcon,
  UserGroupIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import ProfileSettings from '@/components/settings/ProfileSettings';
import DeviceSettings from '@/components/settings/DeviceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import BillingSettings from '@/components/settings/BillingSettings';
import TeamSettings from '@/components/settings/TeamSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';

const tabs = [
  { name: 'Profile', icon: UserCircleIcon, component: ProfileSettings },
  { name: 'WhatsApp Devices', icon: DevicePhoneMobileIcon, component: DeviceSettings },
  { name: 'Notifications', icon: BellIcon, component: NotificationSettings },
  { name: 'Security', icon: KeyIcon, component: SecuritySettings },
  { name: 'Billing', icon: CreditCardIcon, component: BillingSettings },
  { name: 'Team', icon: UserGroupIcon, component: TeamSettings },
  { name: 'Language & Region', icon: LanguageIcon, component: LanguageSettings },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation(['settings']);

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings:title')}</h1>
        <p className="text-gray-600 mt-1">{t('settings:description')}</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    activeTab === idx
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}