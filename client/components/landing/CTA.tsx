'use client';

import React from 'react';
import { ArrowRight, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-whatsapp-green to-green-700">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6">
          <Zap className="h-4 w-4 text-yellow-300 mr-2" />
          <span className="text-sm font-medium text-white">7-Day Free Trial on Pro Plan</span>
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Supercharge Your WhatsApp Marketing?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Join 10,000+ businesses using WhatsFlow. Start with a free trial, upgrade when you're ready.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-whatsapp-green hover:bg-gray-100 shadow-xl text-lg px-8 py-4"
            >
              Start Free Trial Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <span className="text-white/80 text-sm">No credit card required</span>
        </div>

        {/* Trust Bar */}
        <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$0</div>
            <div className="text-xs text-white/70">Free Plan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
              $19/mo
            </div>
            <div className="text-xs text-white/70">Most Popular</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">7 Days</div>
            <div className="text-xs text-white/70">Free Trial</div>
          </div>
        </div>
      </div>
    </section>
  );
}