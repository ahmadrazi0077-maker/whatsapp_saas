'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageAlerts: true,
    marketingEmails: false,
  });

  const handleSave = async () => {
    try {
      // API call will go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive email updates about your account</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded"
          />
        </label>
        <label className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-gray-500">Receive browser notifications</p>
          </div>
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded"
          />
        </label>
        <label className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">Message Alerts</p>
            <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
          </div>
          <input
            type="checkbox"
            checked={settings.messageAlerts}
            onChange={(e) => setSettings({ ...settings, messageAlerts: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded"
          />
        </label>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
