'use client';

import React, { useState } from 'react';
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const API_URL = '${process.env.NEXT_PUBLIC_API_URL}';

export function PricingPlans({ onSelectPlan }: { onSelectPlan?: any }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      yearlyPrice: 0,
      messages: '100',
      devices: 1,
      contacts: '100',
      features: ['1 WhatsApp Number', '100 Messages/Month', '5 Auto Reply Rules', '100 Contacts'],
      icon: Zap,
      color: 'bg-green-500',
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      yearlyPrice: 7,
      messages: '1,000',
      devices: 1,
      contacts: '500',
      features: ['1 WhatsApp Number', '1,000 Messages/Month', 'Unlimited Auto Replies', 'Contact Management', 'Basic Analytics', 'Email Support'],
      icon: Star,
      color: 'bg-blue-500',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19,
      yearlyPrice: 15,
      messages: '5,000',
      devices: 2,
      contacts: '2,000',
      features: ['2 WhatsApp Numbers', '5,000 Messages/Month', 'Broadcast Messaging', 'Advanced Contact Tagging', 'Priority Support', 'Real-time Chat Inbox'],
      icon: Crown,
      color: 'bg-purple-500',
      popular: true,
      badge: 'MOST POPULAR 🔥',
    },
    {
      id: 'business',
      name: 'Business',
      price: 39,
      yearlyPrice: 31,
      messages: '15,000',
      devices: 5,
      contacts: '10,000',
      features: ['5 WhatsApp Numbers', '15,000 Messages/Month', 'Team Access (Multi-User)', 'Advanced Analytics', 'Automation Logs', 'Faster Delivery'],
      icon: Crown,
      color: 'bg-orange-500',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      yearlyPrice: null,
      messages: 'Unlimited',
      devices: 'Unlimited',
      contacts: 'Unlimited',
      features: ['Unlimited Numbers', 'Unlimited Messages', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'Custom Features'],
      icon: Crown,
      color: 'bg-red-500',
      custom: true,
    },
  ];

  const handleSubscribe = async (planId: string, price: number | null) => {
    if (planId === 'free') {
      onSelectPlan?.('free');
      return;
    }
    if (planId === 'enterprise') {
      window.location.href = 'mailto:enterprise@whatsflow.com?subject=Enterprise Plan Inquiry';
      return;
    }

    setLoading(planId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId, billingCycle }),
      });

      const data = await response.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error('Stripe error:', error);
    } finally {
      setLoading(null);
    }
  };

  const displayPrice = (plan: any) => {
    if (plan.custom) return 'Custom';
    if (plan.price === 0) return 'Free';
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    return `$${price}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600 mb-8">Choose the plan that fits your business needs</p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              billingCycle === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            }`}
          >
            Yearly
            <span className="text-xs text-green-600 font-bold ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-5 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-sm border-2 p-6 flex flex-col ${
                plan.popular ? 'border-purple-500 shadow-xl scale-105 z-10' : 'border-gray-100'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`w-12 h-12 ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{displayPrice(plan)}</span>
                  {!plan.custom && plan.price > 0 && (
                    <span className="text-gray-500 text-sm">/mo</span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ${plan.yearlyPrice}/mo billed yearly
                  </p>
                )}
              </div>

              {/* Limits */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Messages</span>
                  <span className="font-semibold text-gray-900">{plan.messages}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Devices</span>
                  <span className="font-semibold text-gray-900">{plan.devices}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Contacts</span>
                  <span className="font-semibold text-gray-900">{plan.contacts}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleSubscribe(plan.id, plan.price)}
                loading={loading === plan.id}
                className={`w-full ${plan.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                variant={plan.popular ? 'primary' : plan.id === 'free' ? 'outline' : 'primary'}
              >
                {plan.id === 'free' ? 'Get Started Free' :
                 plan.id === 'enterprise' ? 'Contact Us' :
                 `Subscribe ${displayPrice(plan)}/mo`}
                {!plan.custom && plan.id !== 'free' && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Money Back Guarantee */}
      <div className="text-center mt-12 text-sm text-gray-500">
        <p>🔒 Secure payment via Stripe • Cancel anytime • 7-day money-back guarantee</p>
      </div>
    </div>
  );
}