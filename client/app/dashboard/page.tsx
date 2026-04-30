'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Dashboard loaded, user:', user);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your WhatsApp business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Messages</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Contacts</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Chats</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Connected Devices</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/contacts"
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition"
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-semibold text-lg">Import Contacts</h3>
          <p className="text-green-100 text-sm mt-1">Add contacts from CSV</p>
        </Link>
        <Link
          href="/dashboard/analytics"
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition"
        >
          <div className="text-2xl mb-2">📈</div>
          <h3 className="font-semibold text-lg">Analytics Report</h3>
          <p className="text-purple-100 text-sm mt-1">Download detailed report</p>
        </Link>
        <Link
          href="/dashboard/devices"
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg transition"
        >
          <div className="text-2xl mb-2">📱</div>
          <h3 className="font-semibold text-lg">Connect Device</h3>
          <p className="text-orange-100 text-sm mt-1">Add new WhatsApp device</p>
        </Link>
      </div>
    </div>
  );
}
