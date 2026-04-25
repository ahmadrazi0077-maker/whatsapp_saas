'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChatBubbleLeftRightIcon, 
  UsersIcon, 
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentChats from '@/components/dashboard/RecentChats';
import MessageChart from '@/components/dashboard/MessageChart';
import DeviceStatus from '@/components/shared/DeviceStatus';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalContacts: 0,
    activeChats: 0,
    responseRate: 0,
    avgResponseTime: 0,
    satisfactionRate: 0
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
      toast.error(t('common:errors.generic'));
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard:title')}</h1>
          <p className="text-gray-600 mt-1">{t('dashboard:welcome_back')}</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          {t('dashboard:export_report')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title={t('dashboard:stats.total_messages')}
          value={stats.totalMessages.toLocaleString()}
          icon={ChatBubbleLeftRightIcon}
          trend="+12%"
          color="blue"
        />
        <StatsCard
          title={t('dashboard:stats.total_contacts')}
          value={stats.totalContacts.toLocaleString()}
          icon={UsersIcon}
          trend="+8%"
          color="green"
        />
        <StatsCard
          title={t('dashboard:stats.active_chats')}
          value={stats.activeChats.toString()}
          icon={DevicePhoneMobileIcon}
          trend="+5%"
          color="purple"
        />
        <StatsCard
          title={t('dashboard:stats.response_rate')}
          value={`${stats.responseRate}%`}
          icon={ArrowTrendingUpIcon}
          trend="+3%"
          color="orange"
        />
        <StatsCard
          title={t('dashboard:stats.avg_response_time')}
          value={`${stats.avgResponseTime}s`}
          icon={ClockIcon}
          trend="-2s"
          color="red"
          trendDirection="down"
        />
        <StatsCard
          title={t('dashboard:stats.satisfaction_rate')}
          value={`${stats.satisfactionRate}%`}
          icon={CheckBadgeIcon}
          trend="+5%"
          color="indigo"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t('dashboard:message_volume')}</h2>
            <select className="border rounded-lg px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <MessageChart data={chartData} />
        </div>

        {/* Device Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard:device_status')}</h2>
          <DeviceStatus />
        </div>
      </div>

      {/* Recent Chats */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">{t('dashboard:recent_chats')}</h2>
        </div>
        <RecentChats />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <EnvelopeIcon className="h-6 w-6 mb-2" />
          <p className="font-semibold">{t('dashboard:send_broadcast')}</p>
          <p className="text-sm opacity-90">Send bulk messages</p>
        </button>
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <UsersIcon className="h-6 w-6 mb-2" />
          <p className="font-semibold">{t('dashboard:import_contacts')}</p>
          <p className="text-sm opacity-90">Add new contacts</p>
        </button>
        <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <DevicePhoneMobileIcon className="h-6 w-6 mb-2" />
          <p className="font-semibold">{t('dashboard:connect_device')}</p>
          <p className="text-sm opacity-90">Add WhatsApp device</p>
        </button>
        <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <ChartBarIcon className="h-6 w-6 mb-2" />
          <p className="font-semibold">{t('dashboard:view_analytics')}</p>
          <p className="text-sm opacity-90">Detailed reports</p>
        </button>
      </div>
    </div>
  );
}