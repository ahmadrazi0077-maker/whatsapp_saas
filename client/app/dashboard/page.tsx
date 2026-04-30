'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dashboard mounted');
    console.log('User:', user);
    console.log('Token:', token?.substring(0, 20));
    console.log('Loading:', loading);
  }, [user, token, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p>Please log in to view dashboard</p>
          <a href="/auth/login" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          Dashboard is working! Here's your business overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Total Messages</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Total Contacts</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Active Chats</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Debug Info</h3>
        <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
          {JSON.stringify({ user, token: token?.substring(0, 50) + '...' }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
