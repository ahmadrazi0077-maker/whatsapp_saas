'use client';

import React from 'react';
import { ArrowRight, CheckCircle, Zap, Shield, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-whatsapp-green/5 via-green-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-whatsapp-green/10 rounded-full">
              <Zap className="h-4 w-4 text-whatsapp-green mr-2" />
              <span className="text-sm font-medium text-whatsapp-green">🚀 Start Free - No Credit Card Required</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              WhatsApp Automation
              <span className="block text-whatsapp-green">Made Simple & Affordable</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Send bulk messages, manage chats, and automate your WhatsApp business. 
              Plans starting at <strong className="text-gray-900">$9/month</strong>. 
              <span className="block mt-1 text-sm text-whatsapp-green font-medium">✨ 7-day free trial on Pro plan!</span>
            </p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-whatsapp-green hover:bg-whatsapp-green-dark shadow-lg shadow-whatsapp-green/25">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2">
                    View Plans
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-whatsapp-green mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-whatsapp-green mr-1" />
                  7-day Pro trial free
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-whatsapp-green mr-1" />
                  Cancel anytime
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">1M+</div>
                <div className="text-sm text-gray-600">Messages Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right - Trust Badges */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-lg font-semibold text-gray-900">Most Popular Plan</p>
                <div className="text-4xl font-bold text-whatsapp-green mt-2">$19<span className="text-lg text-gray-500">/mo</span></div>
                <p className="text-sm text-gray-500 mt-1">or $15/mo billed yearly (Save 20%)</p>
              </div>
              <ul className="space-y-3 mb-6">
                {['2 WhatsApp Numbers', '5,000 Messages/Month', 'Broadcast Messaging', 'Advanced Contact Tagging', 'Priority Support', 'Real-time Chat Inbox'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-whatsapp-green flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button className="w-full">Start 7-Day Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}