'use client';

import React, { useState } from 'react';
import { Check, Zap, Crown, Star, ArrowRight, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const API_URL = 'http://localhost:3001/api';

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      desc: 'For testing & exploration',
      price: 0,
      yearlyPrice: 0,
      messages: '100',
      devices: 1,
      contacts: '100',
      autoReplies: '5 Rules',
      features: [
        '1 WhatsApp Number',
        '100 Messages/Month',
        '5 Auto Reply Rules',
        '100 Contacts Limit',
        'Basic Dashboard',
      ],
      icon: Zap,
      color: 'bg-gray-500',
      borderColor: 'border-gray-200',
      cta: 'Get Started Free',
      href: '/register',
    },
    {
      id: 'starter',
      name: 'Starter',
      desc: 'For small businesses',
      price: 9,
      yearlyPrice: 7,
      messages: '1,000',
      devices: 1,
      contacts: '500',
      autoReplies: 'Unlimited',
      features: [
        '1 WhatsApp Number',
        '1,000 Messages/Month',
        'Unlimited Auto Replies',
        'Contact Management',
        'Basic Analytics',
        'Email Support',
      ],
      icon: Star,
      color: 'bg-blue-500',
      borderColor: 'border-blue-200',
      cta: 'Start 7-Day Trial',
      href: '/register',
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: 'For growing businesses',
      price: 19,
      yearlyPrice: 15,
      messages: '5,000',
      devices: 2,
      contacts: '2,000',
      autoReplies: 'Unlimited',
      features: [
        '2 WhatsApp Numbers',
        '5,000 Messages/Month',
        'Broadcast Messaging',
        'Advanced Contact Tagging',
        'Priority Support',
        'Real-time Chat Inbox',
        'Message Scheduling',
      ],
      icon: Crown,
      color: 'bg-purple-500',
      borderColor: 'border-purple-300',
      popular: true,
      badge: '🔥 MOST POPULAR',
      cta: 'Start Free Trial',
      href: '/register?plan=pro',
    },
    {
      id: 'business',
      name: 'Business',
      desc: 'For scaling teams',
      price: 39,
      yearlyPrice: 31,
      messages: '15,000',
      devices: 5,
      contacts: '10,000',
      autoReplies: 'Unlimited',
      features: [
        '5 WhatsApp Numbers',
        '15,000 Messages/Month',
        'Team Access (Multi-User)',
        'Advanced Analytics',
        'Automation Logs',
        'Faster Message Delivery',
        'Custom Webhooks',
      ],
      icon: Crown,
      color: 'bg-orange-500',
      borderColor: 'border-orange-200',
      cta: 'Start 7-Day Trial',
      href: '/register?plan=business',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      desc: 'For large organizations',
      price: null,
      yearlyPrice: null,
      messages: 'Unlimited',
      devices: 'Unlimited',
      contacts: 'Unlimited',
      autoReplies: 'Unlimited',
      features: [
        'Unlimited Numbers',
        'Unlimited Messages',
        'Dedicated Support',
        'Custom Integrations',
        'SLA Guarantee',
        'White Label Option',
        'Custom Training',
      ],
      icon: Crown,
      color: 'bg-red-500',
      borderColor: 'border-red-200',
      custom: true,
      cta: 'Contact Sales',
      href: 'mailto:enterprise@whatsflow.com',
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start free, upgrade when you grow. All plans include a <strong>7-day free trial</strong> on Pro.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1.5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'yearly' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const displayPrice = plan.custom ? 'Custom' : plan.price === 0 ? 'Free' : `$${billingCycle === 'yearly' ? plan.yearlyPrice : plan.price}`;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-5 flex flex-col transition-all hover:shadow-xl ${
                  plan.popular ? `${plan.borderColor} shadow-xl scale-[1.03] z-10` : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div className={`text-center mb-5 ${plan.popular ? 'mt-4' : ''}`}>
                  <div className={`w-10 h-10 ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-gray-900">{displayPrice}</span>
                    {!plan.custom && plan.price > 0 && (
                      <span className="text-gray-500 text-sm">/mo</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ${plan.yearlyPrice}/mo billed yearly
                    </p>
                  )}
                  {plan.price === 0 && (
                    <p className="text-xs text-gray-400 mt-1">Free forever</p>
                  )}
                </div>

                {/* Limits Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Messages</span>
                    <span className="font-semibold text-gray-900">{plan.messages}/mo</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Numbers</span>
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
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.href} className="mt-auto">
                  <Button
                    className={`w-full text-sm ${plan.popular ? 'bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/25' : plan.id === 'free' ? '' : ''}`}
                    variant={plan.popular ? 'primary' : plan.id === 'free' ? 'outline' : plan.custom ? 'outline' : 'primary'}
                  >
                    {plan.cta}
                    {plan.id !== 'free' && !plan.custom && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-10 space-y-2">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Secure Stripe Payments</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Cancel Anytime</span>
          </div>
          <p className="text-xs text-gray-400">
            All paid plans include a 7-day free trial. No credit card required for Free plan.
          </p>
        </div>
      </div>
    </section>
  );
}