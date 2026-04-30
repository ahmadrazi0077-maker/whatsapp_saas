'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { messagesApi, contactsApi, devicesApi, analyticsApi } from '@/lib/supabaseApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface AnalyticsData {
  totalMessages: number;
  totalContacts: number;
  activeChats: number;
  devices: number;
  responseRate: number;
  avgResponseTime: number;
  satisfactionRate: number;
  messagesByDay: { date: string; count: number }[];
  topContacts: { name: string; messages: number }[];
  messageTypes: { type: string; count: number }[];
  hourlyActivity: { hour: number; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalMessages: 0,
    totalContacts: 0,
    activeChats: 0,
    devices: 0,
    responseRate: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    messagesByDay: [],
    topContacts: [],
    messageTypes: [],
    hourlyActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch real data
      const [conversations, contacts, devices] = await Promise.all([
        messagesApi.getConversations().catch(() => []),
        contactsApi.getAll().catch(() => []),
        devicesApi.getAll().catch(() => []),
      ]);

      // Calculate message statistics
      const totalMessages = conversations.reduce((sum: number, conv: any) => sum + (conv.message_count || 0), 0);
      const activeChats = conversations.filter((c: any) => c.status === 'ACTIVE').length;
      const connectedDevices = devices.filter((d: any) => d.status === 'CONNECTED').length;

      // Generate mock chart data (replace with real data from API)
      const days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date(),
      });

      const messagesByDay = days.map(day => ({
        date: format(day, 'MMM dd'),
        count: Math.floor(Math.random() * 50) + 10,
      }));

      const topContacts = [
        { name: 'Ahmed Raza', messages: 156 },
        { name: 'Sarah Khan', messages: 98 },
        { name: 'Tech Solutions', messages: 67 },
        { name: 'Online Store', messages: 45 },
        { name: 'John Doe', messages: 34 },
      ];

      const messageTypes = [
        { type: 'Text', count: Math.floor(totalMessages * 0.75) },
        { type: 'Image', count: Math.floor(totalMessages * 0.15) },
        { type: 'Document', count: Math.floor(totalMessages * 0.05) },
        { type: 'Audio', count: Math.floor(totalMessages * 0.03) },
        { type: 'Video', count: Math.floor(totalMessages * 0.02) },
      ];

      const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 30) + (i >= 9 && i <= 18 ? 20 : 5),
      }));

      setData({
        totalMessages,
        totalContacts: contacts.length,
        activeChats,
        devices: connectedDevices,
        responseRate: 94,
        avgResponseTime: 45,
        satisfactionRate: 98,
        messagesByDay,
        topContacts,
        messageTypes,
        hourlyActivity,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: data.messagesByDay.map(d => d.date),
    datasets: [
      {
        label: 'Messages',
        data: data.messagesByDay.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const barChartData = {
    labels: data.hourlyActivity.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'Messages',
        data: data.hourlyActivity.map(h => h.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const pieChartData = {
    labels: data.messageTypes.map(t => t.type),
    datasets: [
      {
        data: data.messageTypes.map(t => t.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, boxWidth: 10 },
      },
    },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your WhatsApp business performance</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <CalendarIcon className="h-5 w-5" />
            <span>Last {dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : '90 Days'}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          {showDateDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-10">
              {[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDateRange(option.value);
                    setShowDateDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Messages"
          value={data.totalMessages.toLocaleString()}
          icon={ChatBubbleLeftRightIcon}
          change="+12%"
          color="blue"
        />
        <MetricCard
          title="Total Contacts"
          value={data.totalContacts.toLocaleString()}
          icon={UsersIcon}
          change="+8%"
          color="green"
        />
        <MetricCard
          title="Active Chats"
          value={data.activeChats.toString()}
          icon={DevicePhoneMobileIcon}
          change="+5%"
          color="purple"
        />
        <MetricCard
          title="Response Rate"
          value={`${data.responseRate}%`}
          icon={ArrowTrendingUpIcon}
          change="+3%"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Message Trend</h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Activity by Hour */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Activity by Hour</h3>
          <div className="h-80">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Message Types Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Message Types</h3>
          <div className="h-80">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Contacts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Most Active Contacts</h3>
          <div className="space-y-3">
            {data.topContacts.map((contact, index) => (
              <div key={contact.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                  <span className="font-medium">{contact.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{contact.messages} msgs</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2"
                      style={{ width: `${(contact.messages / data.topContacts[0].messages) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PerformanceCard
          title="Average Response Time"
          value={`${data.avgResponseTime}s`}
          description="Time to first response"
          icon={ClockIcon}
          trend="-2s"
          color="green"
        />
        <PerformanceCard
          title="Customer Satisfaction"
          value={`${data.satisfactionRate}%`}
          description="Based on feedback"
          icon={ChartBarIcon}
          trend="+5%"
          color="green"
        />
        <PerformanceCard
          title="Connected Devices"
          value={data.devices.toString()}
          description="Active WhatsApp devices"
          icon={DevicePhoneMobileIcon}
          trend="+0"
          color="blue"
        />
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <DocumentArrowDownIcon className="h-5 w-5" />
          Export Report
        </button>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, change, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm text-green-600">{change}</span>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{title}</p>
      </div>
    </motion.div>
  );
}

function PerformanceCard({ title, value, description, icon: Icon, trend, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-green-600">{trend}</span>
      </div>
    </div>
  );
}
