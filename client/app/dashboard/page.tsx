'use client';

import { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  EnvelopeIcon,
  UserPlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/supabaseApi';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalMessages: number;
  totalContacts: number;
  activeChats: number;
  devices: number;
  responseRate: number;
  avgResponseTime: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    totalContacts: 0,
    activeChats: 0,
    devices: 0,
    responseRate: 0,
    avgResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await analyticsApi.getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your WhatsApp business today.
            </p>
          </div>
          <Link
            href="/dashboard/broadcast"
            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition flex items-center gap-2"
          >
            <EnvelopeIcon className="h-5 w-5" />
            Send Broadcast
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard 
          title="Total Messages" 
          value={stats.totalMessages.toLocaleString()} 
          icon={ChatBubbleLeftRightIcon} 
          trend="+12%" 
          color="blue" 
        />
        <StatCard 
          title="Total Contacts" 
          value={stats.totalContacts.toLocaleString()} 
          icon={UsersIcon} 
          trend="+8%" 
          color="green" 
        />
        <StatCard 
          title="Active Chats" 
          value={stats.activeChats.toString()} 
          icon={DevicePhoneMobileIcon} 
          trend="+5%" 
          color="purple" 
        />
        <StatCard 
          title="Response Rate" 
          value={`${stats.responseRate}%`} 
          icon={ArrowTrendingUpIcon} 
          trend="+3%" 
          color="orange" 
        />
        <StatCard 
          title="Connected Devices" 
          value={stats.devices.toString()} 
          icon={DevicePhoneMobileIcon} 
          trend="+0%" 
          color="indigo" 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Import Contacts"
          description="Add contacts from CSV or Excel"
          icon={UserPlusIcon}
          color="green"
          link="/dashboard/contacts"
        />
        <QuickActionCard
          title="Analytics Report"
          description="Download detailed analytics"
          icon={ChartBarIcon}
          color="purple"
          link="/dashboard/analytics"
        />
        <QuickActionCard
          title="Connect Device"
          description="Add a new WhatsApp device"
          icon={DevicePhoneMobileIcon}
          color="orange"
          link="/dashboard/devices"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, trendDirection = 'up' }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          <ArrowTrendingUpIcon className="h-4 w-4" />
          <span>{trend}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{title}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, color, link }: any) {
  return (
    <Link href={link} className={`bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl p-6 text-white hover:shadow-lg transition-all`}>
      <Icon className="h-8 w-8 mb-3" />
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className={`text-${color}-100 text-sm mb-4`}>{description}</p>
      <span className="inline-block bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm transition">
        Get Started →
      </span>
    </Link>
  );
}
