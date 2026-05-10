'use client';

import React, { useState } from 'react';
import { Check, Crown, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const plans = [
    { id: 'free', name: 'Free', price: 0, yearlyPrice: 0, messages: '100', devices: '1', contacts: '100', color: 'bg-gray-50 dark:bg-gray-8000', current: true, features: ['1 WhatsApp Number', '100 Messages/Month', '5 Auto Replies', '100 Contacts'] },
    { id: 'starter', name: 'Starter', price: 9, yearlyPrice: 7, messages: '1,000', devices: '1', contacts: '500', color: 'bg-blue-500', features: ['1 WhatsApp Number', '1,000 Messages/Month', 'Unlimited Auto Replies', 'Contact Management', 'Basic Analytics', 'Email Support'] },
    { id: 'pro', name: 'Pro', price: 19, yearlyPrice: 15, messages: '5,000', devices: '2', contacts: '2,000', color: 'bg-purple-500', popular: true, features: ['2 WhatsApp Numbers', '5,000 Messages/Month', 'Broadcast Messaging', 'Advanced Contact Tagging', 'Priority Support', 'Real-time Chat Inbox'] },
    { id: 'business', name: 'Business', price: 39, yearlyPrice: 31, messages: '15,000', devices: '5', contacts: '10,000', color: 'bg-orange-500', features: ['5 WhatsApp Numbers', '15,000 Messages/Month', 'Team Access', 'Advanced Analytics', 'Automation Logs', 'Faster Delivery'] },
    { id: 'enterprise', name: 'Enterprise', price: null, yearlyPrice: null, messages: 'Unlimited', devices: 'Unlimited', contacts: 'Unlimited', color: 'bg-red-500', custom: true, features: ['Unlimited Numbers', 'Unlimited Messages', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee'] },
  ];

  const displayPrice = (plan: any) => {
    if (plan.custom) return 'Custom';
    if (plan.price === 0) return 'Free';
    return '$' + (billingCycle === 'yearly' ? plan.yearlyPrice : plan.price);
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    if (planId === 'enterprise') { window.location.href = 'mailto:enterprise@whatsflow.com'; return; }
    setLoading(planId);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ planId, billingCycle }),
      });
      const data = await response.json();
      if (data.success && data.data?.url) { window.location.href = data.data.url; }
      else { setError(data.error || 'Failed to create checkout'); }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade Your Plan</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Choose the plan that fits your business</p>
      </div>
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
          <button onClick={() => setBillingCycle('monthly')} className={'px-6 py-2 rounded-full text-sm font-semibold ' + (billingCycle === 'monthly' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500')}>Monthly</button>
          <button onClick={() => setBillingCycle('yearly')} className={'px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ' + (billingCycle === 'yearly' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500')}>Yearly <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Save 20%</span></button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center">{error}</div>}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={'p-5 flex flex-col relative ' + (plan.popular ? 'border-purple-500 shadow-xl scale-105 z-10' : '')}>
            {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>}
            {plan.current && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-50 dark:bg-gray-8000 text-white px-4 py-1 rounded-full text-xs font-bold">CURRENT</div>}
            <div className={'text-center mb-4 ' + ((plan.popular || plan.current) ? 'mt-4' : '')}>
              <div className={'w-10 h-10 ' + plan.color + ' rounded-xl flex items-center justify-center mx-auto mb-2'}>
                {plan.popular ? <Crown className="h-5 w-5 text-white" /> : <Star className="h-5 w-5 text-white" />}
              </div>
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2"><span className="text-2xl font-bold">{displayPrice(plan)}</span>{!plan.custom && plan.price !== null && plan.price > 0 && <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">/mo</span>}</div>
              {billingCycle === 'yearly' && plan.price !== null && plan.price > 0 && <p className="text-xs text-green-600">${plan.yearlyPrice}/mo yearly</p>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 text-xs space-y-1">
              <div className="flex justify-between"><span>Messages</span><span className="font-semibold">{plan.messages}/mo</span></div>
              <div className="flex justify-between"><span>Numbers</span><span className="font-semibold">{plan.devices}</span></div>
              <div className="flex justify-between"><span>Contacts</span><span className="font-semibold">{plan.contacts}</span></div>
            </div>
            <ul className="space-y-1.5 mb-4 flex-1">
              {plan.features.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300"><Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Button onClick={() => handleSubscribe(plan.id)} loading={loading === plan.id} disabled={plan.current || plan.id === 'free'} variant={plan.popular ? 'primary' : 'outline'} className={'w-full text-sm ' + (plan.popular ? 'bg-purple-500 hover:bg-purple-600' : '')}>
              {plan.current ? 'Current Plan' : plan.id === 'free' ? 'Free' : plan.custom ? 'Contact Us' : 'Subscribe ' + displayPrice(plan) + '/mo'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

