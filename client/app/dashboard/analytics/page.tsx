'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalContacts: 0,
    activeChats: 0,
    devices: 0,
  });

  useEffect(() => {
    // Fetch data here
    const fetchData = async () => {
      try {
        const response = await fetch('/api/contacts');
        const contacts = await response.json();
        setStats(prev => ({ ...prev, totalContacts: contacts.length || 0 }));
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Messages</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalMessages}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Contacts</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.totalContacts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Chats</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">{stats.activeChats}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Devices</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">{stats.devices}</p>
        </div>
      </div>
    </div>
  );
}
