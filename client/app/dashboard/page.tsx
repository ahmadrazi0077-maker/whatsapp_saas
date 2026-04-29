'use client';

import { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  UserPlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalMessages: number;
  totalContacts: number;
  activeChats: number;
  responseRate: number;
  avgResponseTime: number;
  satisfactionRate: number;
  devices: number;
}

const StatCard = ({ title, value, icon: Icon, trend, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
        <ArrowTrendingUpIcon className="h-4 w-4" />
        <span>{trend}</span>
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{title}</p>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    totalContacts: 0,
    activeChats: 0,
    responseRate: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    devices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Don't show error toast - just use default values
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Messages', value: stats.totalMessages, icon: ChatBubbleLeftRightIcon, trend: '+12%', color: 'blue', delay: 0 },
    { title: 'Total Contacts', value: stats.totalContacts, icon: UsersIcon, trend: '+8%', color: 'green', delay: 0.1 },
    { title: 'Active Chats', value: stats.activeChats, icon: DevicePhoneMobileIcon, trend: '+5%', color: 'purple', delay: 0.2 },
    { title: 'Response Rate', value: `${stats.responseRate}%`, icon: ArrowTrendingUpIcon, trend: '+3%', color: 'orange', delay: 0.3 },
    { title: 'Avg Response Time', value: `${stats.avgResponseTime}s`, icon: ClockIcon, trend: '-2s', color: 'red', delay: 0.4 },
    { title: 'Devices', value: stats.devices, icon: DevicePhoneMobileIcon, trend: '+0%', color: 'indigo', delay: 0.5 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
      >
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
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <UserPlusIcon className="h-8 w-8 mb-3" />
          <h3 className="font-semibold text-lg mb-1">Import Contacts</h3>
          <p className="text-green-100 text-sm mb-4">Add contacts from CSV or Excel</p>
          <Link
            href="/dashboard/contacts"
            className="inline-block bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm transition"
          >
            Import Now →
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <ChartBarIcon className="h-8 w-8 mb-3" />
          <h3 className="font-semibold text-lg mb-1">Analytics Report</h3>
          <p className="text-purple-100 text-sm mb-4">Download detailed analytics</p>
          <button className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm transition">
            Download Report →
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <DevicePhoneMobileIcon className="h-8 w-8 mb-3" />
          <h3 className="font-semibold text-lg mb-1">Connect Device</h3>
          <p className="text-orange-100 text-sm mb-4">Add a new WhatsApp device</p>
          <Link
            href="/dashboard/devices"
            className="inline-block bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm transition"
          >
            Connect Now →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
