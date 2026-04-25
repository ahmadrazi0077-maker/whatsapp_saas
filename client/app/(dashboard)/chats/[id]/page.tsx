'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function ChatDetailPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chat Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Conversation ID: {id}</p>
        <p className="text-gray-600 mt-2">Chat interface will appear here.</p>
      </div>
    </div>
  );
}
