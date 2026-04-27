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
import StatsCard from '@/components/dashboard/StatsCard';
import RecentChats from '@/components/dashboard/RecentChats';
import MessageChart from '@/components/dashboard/MessageChart';
import DeviceStatus from '@/components/shared/DeviceStatus';
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
  messagesTrend: number;
  contactsTrend: number;
  chatsTrend: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    totalContacts: 0,
    activeChats: 0,
    responseRate: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    messagesTrend: 0,
    contactsTrend: 0,
    chatsTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      setStats(data.stats);
      setChartData(data.chartData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your WhatsApp business today.
            </p>
          </div>
          <Link
            href="/broadcast"
            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition"
          >
            <EnvelopeIcon className="h-5 w-5 inline mr-2" />
            Send Broadcast
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Messages"
          value={stats.totalMessages.toLocaleString()}
          icon={ChatBubbleLeftRightIcon}
          trend={`+${stats.messagesTrend}%`}
          color="blue"
        />
        <StatsCard
          title="Total Contacts"
          value={stats.totalContacts.toLocaleString()}
          icon={UsersIcon}
          trend={`+${stats.contactsTrend}%`}
          color="green"
        />
        <StatsCard
          title="Active Chats"
          value={stats.activeChats.toString()}
          icon={DevicePhoneMobileIcon}
          trend={`+${stats.chatsTrend}%`}
          color="purple"
        />
        <StatsCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          icon={ArrowTrendingUpIcon}
          trend="+3%"
          color="orange"
        />
        <StatsCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime}s`}
          icon={ClockIcon}
          trend="-2s"
          color="red"
          trendDirection="down"
        />
        <StatsCard
          title="Satisfaction Rate"
          value={`${stats.satisfactionRate}%`}
          icon={CheckBadgeIcon}
          trend="+5%"
          color="indigo"
        />
      </div>

      {/* Charts and Device Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Message Volume</h2>
            <select className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <MessageChart data={chartData} />
        </div>

        {/* Device Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Status</h2>
          <DeviceStatus />
          <Link
            href="/devices"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Manage Devices →
          </Link>
        </div>
      </div>

      {/* Recent Chats and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Chats */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Chats</h2>
          </div>
          <RecentChats />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <UserPlusIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Import Contacts</h3>
            <p className="text-green-100 text-sm mb-4">Add contacts from CSV or Excel</p>
            <button className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm transition">
              Import Now →
            </button>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <ChartBarIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Analytics Report</h3>
            <p className="text-purple-100 text-sm mb-4">Download detailed analytics</p>
            <button className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm transition">
              Download Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
