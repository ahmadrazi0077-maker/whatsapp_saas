'use client';
﻿'use client';

import React, { useState, useEffect } from 'react';
import { Crown, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function SubscriptionPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSub(); }, []);

  const fetchSub = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/subscription', { headers: { Authorization: 'Bearer ' + token } });
      const data = await res.json();
      if (data.success) setSub(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" /></div>;

  const plan = sub?.plan || { name: 'Free', price: 0 };
  const usage = sub?.usage || {};
  const isFree = sub?.planId === 'free';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription</h1>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Crown className={'h-8 w-8 ' + (isFree ? 'text-gray-400 dark:text-gray-500' : 'text-yellow-500')} />
            <div>
              <h2 className="text-xl font-bold">{plan.name} Plan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{isFree ? 'Free forever' : '$' + plan.price + '/month'}</p>
            </div>
          </div>
          <span className={'px-3 py-1 rounded-full text-sm font-medium ' + (sub?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
            {sub?.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        {usage && (
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-300">Messages</span><span className="font-medium">{usage.messagesSent}/{usage.messagesLimit === Infinity ? 'unlimited' : usage.messagesLimit}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: Math.min(usage.messagesPercent || 0, 100) + '%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-300">Contacts</span><span className="font-medium">{usage.contactsCreated}/{usage.contactsLimit === Infinity ? 'unlimited' : usage.contactsLimit}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{ width: Math.min(usage.contactsPercent || 0, 100) + '%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-300">Devices</span><span className="font-medium">{usage.devicesConnected}/{usage.devicesLimit === Infinity ? 'unlimited' : usage.devicesLimit}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-purple-500 h-3 rounded-full" style={{ width: Math.min(usage.devicesPercent || 0, 100) + '%' }} /></div>
            </div>
          </div>
        )}
        {isFree ? (
          <Link href="/upgrade"><Button icon={<Crown className="h-4 w-4" />} className="bg-purple-500 hover:bg-purple-600">Upgrade Plan</Button></Link>
        ) : (
          <div className="flex gap-3">
            {sub?.stripeSubscriptionId && <Button variant="danger">Cancel Subscription</Button>}
            <Link href="/upgrade"><Button variant="outline">Change Plan</Button></Link>
          </div>
        )}
      </Card>
    </div>
  );
}
﻿'use client';

import React, { useState, useEffect } from 'react';
import { Crown, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';;

export default function SubscriptionPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSub(); }, []);

  const fetchSub = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/subscription', { headers: { Authorization: 'Bearer ' + token } });
      const data = await res.json();
      if (data.success) setSub(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" /></div>;

  const plan = sub?.plan || { name: 'Free', price: 0 };
  const usage = sub?.usage || {};
  const isFree = sub?.planId === 'free';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription</h1>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Crown className={'h-8 w-8 ' + (isFree ? 'text-gray-400 dark:text-gray-500' : 'text-yellow-500')} />
            <div>
              <h2 className="text-xl font-bold">{plan.name} Plan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{isFree ? 'Free forever' : '$' + plan.price + '/month'}</p>
            </div>
          </div>
          <span className={'px-3 py-1 rounded-full text-sm font-medium ' + (sub?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
            {sub?.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        {usage && (
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-300">Messages</span><span className="font-medium">{usage.messagesSent}/{usage.messagesLimit === Infinity ? 'unlimited' : usage.messagesLimit}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: Math.min(usage.messagesPercent || 0, 100) + '%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-300">Contacts</span><span className="font-medium">{usage.contactsCreated}/{usage.contactsLimit === Infinity ? 'unlimited' : usage.contactsLimit}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{ width: Math.min(usage.contactsPercent || 0, 100) + '%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-300">Devices</span><span className="font-medium">{usage.devicesConnected}/{usage.devicesLimit === Infinity ? 'unlimited' : usage.devicesLimit}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-purple-500 h-3 rounded-full" style={{ width: Math.min(usage.devicesPercent || 0, 100) + '%' }} /></div>
            </div>
          </div>
        )}
        {isFree ? (
          <Link href="/upgrade"><Button icon={<Crown className="h-4 w-4" />} className="bg-purple-500 hover:bg-purple-600">Upgrade Plan</Button></Link>
        ) : (
          <div className="flex gap-3">
            {sub?.stripeSubscriptionId && <Button variant="danger">Cancel Subscription</Button>}
            <Link href="/upgrade"><Button variant="outline">Change Plan</Button></Link>
          </div>
        )}
      </Card>
    </div>
  );
}

