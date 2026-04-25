'use client';

import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function BillingSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Billing Settings</h2>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-2xl font-bold text-blue-600">Free</p>
            </div>
            <CreditCardIcon className="h-12 w-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Messages per month</span>
              <span>1,000 / 1,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between text-sm mt-4">
              <span>Devices allowed</span>
              <span>1 / 1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Team members</span>
              <span>1 / 1</span>
            </div>
          </div>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Upgrade Plan
        </button>
        <p className="text-xs text-gray-500 text-center mt-4">
          Need a custom plan? <a href="#" className="text-blue-600 hover:underline">Contact sales</a>
        </p>
      </div>
    </div>
  );
}
