'use client';

import React from 'react';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap,
  Smartphone,
  Globe,
  Mail
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: MessageSquare,
    title: 'Bulk Messaging',
    description: 'Send personalized messages to thousands of contacts simultaneously with our advanced broadcasting engine.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Contact Management',
    description: 'Organize contacts with tags, groups, and custom fields. Import/export with ease.',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track delivery rates, read receipts, and engagement metrics in real-time.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Clock,
    title: 'Message Scheduling',
    description: 'Schedule messages for optimal delivery times. Set it and forget it.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Shield,
    title: 'Anti-Ban Protection',
    description: 'Built-in safeguards to prevent WhatsApp bans. Smart rate limiting and human-like behavior.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    icon: Smartphone,
    title: 'Multi-Device Support',
    description: 'Connect multiple WhatsApp devices. Manage all from one dashboard.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Globe,
    title: 'Webhook Integration',
    description: 'Connect with your existing tools via webhooks and APIs. Automate your workflow.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: Mail,
    title: 'Auto-Reply Rules',
    description: 'Set up intelligent auto-replies based on keywords, time, or contact groups.',
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Scale
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you automate and streamline your WhatsApp communications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} hover className="p-6">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}