'use client';

import { useState } from 'react';
import {
  UserCircleIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  KeyIcon,
  CreditCardIcon,
  UserGroupIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Settings Components
function ProfileSettings() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+92 300 1234567',
    company: 'Acme Inc',
  });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Save Changes
        </button>
      </form>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Change Password
        </button>
      </form>
    </div>
  );
}

function BillingSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Billing Settings</h2>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Current Plan</span>
          <span className="text-blue-600 font-semibold">Free</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>• 1,000 messages per month</p>
          <p>• 1 device allowed</p>
          <p>• 1 team member</p>
        </div>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        Upgrade Plan
      </button>
    </div>
  );
}

const tabs = [
  { name: 'Profile', icon: UserCircleIcon, component: ProfileSettings },
  { name: 'Security', icon: KeyIcon, component: SecuritySettings },
  { name: 'Billing', icon: CreditCardIcon, component: BillingSettings },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
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
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
