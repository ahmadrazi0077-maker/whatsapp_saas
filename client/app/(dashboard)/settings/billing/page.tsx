'use client';

import React from 'react';

export default function BillingSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Manage your subscription plan.</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">Current Plan: Free</p>
          <p className="text-sm text-gray-600 mt-1">Upgrade to access more features</p>
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
