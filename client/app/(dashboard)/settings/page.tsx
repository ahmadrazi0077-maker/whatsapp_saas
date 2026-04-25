'use client';

import React, { useState } from 'react';
import {
  UserCircleIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  KeyIcon,
  CreditCardIcon,
  UserGroupIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

// Import all settings components
import ProfileSettings from './ProfileSettings';
import DeviceSettings from './DeviceSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import BillingSettings from './BillingSettings';
import TeamSettings from './TeamSettings';
import LanguageSettings from './LanguageSettings';

const tabs = [
  { name: 'Profile', icon: UserCircleIcon, component: ProfileSettings },
  { name: 'WhatsApp Devices', icon: DevicePhoneMobileIcon, component: DeviceSettings },
  { name: 'Notifications', icon: BellIcon, component: NotificationSettings },
  { name: 'Security', icon: KeyIcon, component: SecuritySettings },
  { name: 'Billing', icon: CreditCardIcon, component: BillingSettings },
  { name: 'Team', icon: UserGroupIcon, component: TeamSettings },
  { name: 'Language', icon: LanguageIcon, component: LanguageSettings },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
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
