'use client';

import React from 'react';

export default function TeamSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Invite team members to collaborate.</p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Invite Member
        </button>
      </div>
    </div>
  );
}
