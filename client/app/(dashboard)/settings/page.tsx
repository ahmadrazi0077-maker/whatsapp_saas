'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
          <p className="text-gray-600">Manage your account information</p>
          <button className="mt-4 text-blue-600 hover:underline">Edit Profile →</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Team Settings</h3>
          <p className="text-gray-600">Manage team members and permissions</p>
          <button className="mt-4 text-blue-600 hover:underline">Manage Team →</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Billing</h3>
          <p className="text-gray-600">Manage your subscription and payment methods</p>
          <button className="mt-4 text-blue-600 hover:underline">View Billing →</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <p className="text-gray-600">Configure your notification preferences</p>
          <button className="mt-4 text-blue-600 hover:underline">Configure →</button>
        </div>
      </div>
    </div>
  );
}
