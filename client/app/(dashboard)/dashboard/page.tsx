'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Smartphone, Crown, ArrowRight, AlertTriangle, Radio } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://whatsapp-saas-tftc.onrender.com/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  const user = data || {};
  const usage = data?.usage || {};
  const plan = user?.plan || 'free';
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
  const isFree = plan === 'free';
  const msgPercent = usage?.messagesPercent || 0;
  const isNearLimit = usage?.isNearLimit;
  const isAtLimit = usage?.isAtLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            You're on <span className={`font-semibold ${isFree ? 'text-gray-600 dark:text-gray-300' : 'text-whatsapp-green'}`}>
              {planName} Plan
            </span>
          </p>
        </div>
        {isFree ? (
          <Link href="/upgrade">
            <Button icon={<Crown className="h-4 w-4" />} className="bg-purple-500 hover:bg-purple-600 shadow-lg">
              Upgrade to Pro - $19/mo
            </Button>
          </Link>
        ) : (
          <Link href="/subscription">
            <Button variant="outline" icon={<Crown className="h-4 w-4" />}>Manage Plan</Button>
          </Link>
        )}
      </div>

      {/* Limit Alerts */}
      {isAtLimit && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Message limit reached!</p>
              <p className="text-sm text-red-600">{usage.messagesSent}/{usage.messagesLimit} messages used</p>
            </div>
          </div>
          <Link href="/upgrade"><Button size="sm">Upgrade Now</Button></Link>
        </div>
      )}
      {isNearLimit && !isAtLimit && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="font-semibold text-yellow-700">Approaching limit!</p>
              <p className="text-sm text-yellow-600">{msgPercent}% used - consider upgrading</p>
            </div>
          </div>
          <Link href="/upgrade"><Button size="sm" variant="outline">View Plans</Button></Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <MessageSquare className="h-8 w-8 text-blue-500 mb-3" />
          <div className="text-2xl font-bold">{usage.messagesSent || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Messages Used</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className={`h-1.5 rounded-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(msgPercent, 100)}%` }} />
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Limit: {usage.messagesLimit === Infinity ? 'Unlimited' : usage.messagesLimit}
          </div>
        </Card>

        <Card className="p-5">
          <Users className="h-8 w-8 text-green-500 mb-3" />
          <div className="text-2xl font-bold">{usage.contactsCreated || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Contacts</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Limit: {usage.contactsLimit === Infinity ? 'Unlimited' : usage.contactsLimit}
          </div>
        </Card>

        <Card className="p-5">
          <Smartphone className="h-8 w-8 text-purple-500 mb-3" />
          <div className="text-2xl font-bold">{usage.devicesConnected || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Devices</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Limit: {usage.devicesLimit === Infinity ? 'Unlimited' : usage.devicesLimit}
          </div>
        </Card>

        <Card className={`p-5 ${isFree ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
          <Crown className={`h-8 w-8 mb-3 ${isFree ? 'text-purple-500' : 'text-green-500'}`} />
          <div className="text-xl font-bold">{planName}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Current Plan</div>
          {isFree && (
            <Link href="/upgrade" className="text-xs text-purple-600 font-medium mt-1 block hover:underline">
              Upgrade
            </Link>
          )}
        </Card>
      </div>

      {/* Quick Actions + Upgrade Promo */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/chats" className="p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-700 rounded-xl text-center transition-colors">
              <MessageSquare className="h-6 w-6 text-whatsapp-green mx-auto mb-2" />
              <span className="text-sm font-medium">Chats</span>
            </Link>
            <Link href="/dashboard/contacts" className="p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-700 rounded-xl text-center transition-colors">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <span className="text-sm font-medium">Contacts</span>
            </Link>
            <Link href="/dashboard/devices" className="p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-700 rounded-xl text-center transition-colors">
              <Smartphone className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <span className="text-sm font-medium">Devices</span>
            </Link>
            <Link href="/dashboard/broadcast" className="p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-700 rounded-xl text-center transition-colors">
              <Radio className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <span className="text-sm font-medium">Broadcast</span>
            </Link>
          </div>
        </Card>

        {isFree ? (
          <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-6 w-6" />
              <h2 className="font-semibold text-lg">Upgrade to Pro</h2>
            </div>
            <ul className="space-y-2 mb-4 text-sm text-purple-100">
              <li>5,000 messages/month (50x more)</li>
              <li>2 WhatsApp numbers</li>
              <li>Broadcast messaging</li>
              <li>Priority support</li>
              <li>7-day free trial</li>
            </ul>
            <Link href="/upgrade">
              <Button className="w-full bg-white dark:bg-gray-800 text-purple-600 hover:bg-gray-100 dark:bg-gray-700">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Plan Usage</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Messages</span>
                  <span className="font-medium">{usage.messagesSent}/{usage.messagesLimit === Infinity ? 'Unlimited' : usage.messagesLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-whatsapp-green h-2 rounded-full" style={{ width: `${Math.min(msgPercent, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Contacts</span>
                  <span className="font-medium">{usage.contactsCreated}/{usage.contactsLimit === Infinity ? 'Unlimited' : usage.contactsLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(usage.contactsPercent || 0, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Devices</span>
                  <span className="font-medium">{usage.devicesConnected}/{usage.devicesLimit === Infinity ? 'Unlimited' : usage.devicesLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(usage.devicesPercent || 0, 100)}%` }} />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}     
