'use client';

import React from 'react';

export default function ChatsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chats</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">No active conversations.</p>
      </div>
    </div>
  );
}
