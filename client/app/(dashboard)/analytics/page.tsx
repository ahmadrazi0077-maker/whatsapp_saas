'use client';

import React from 'react';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Message Volume</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-gray-600 mt-2">Total messages this month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Response Time</h3>
          <p className="text-3xl font-bold text-green-600">0s</p>
          <p className="text-gray-600 mt-2">Average response time</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Satisfaction</h3>
          <p className="text-3xl font-bold text-purple-600">0%</p>
          <p className="text-gray-600 mt-2">Based on feedback</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
          <p className="text-3xl font-bold text-orange-600">0%</p>
          <p className="text-gray-600 mt-2">Messages to conversions</p>
        </div>
      </div>
    </div>
  );
}
