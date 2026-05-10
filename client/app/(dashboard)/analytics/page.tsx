'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.analytics.dashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <MessageSquare className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Messages</div>
        </Card>
        <Card className="p-6">
          <Users className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold">{stats?.activeContacts || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Active Contacts</div>
        </Card>
        <Card className="p-6">
          <BarChart3 className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{stats?.deliveryRate || '0%'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Delivery Rate</div>
        </Card>
        <Card className="p-6">
          <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold">{stats?.connectedDevices || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Connected Devices</div>
        </Card>
      </div>
    </div>
  );
}
