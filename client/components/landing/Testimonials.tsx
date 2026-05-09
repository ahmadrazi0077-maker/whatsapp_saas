'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechCorp',
    content: 'WhatsFlow transformed our customer communication. We went from manual messaging to automated campaigns that doubled our response rate.',
    rating: 5,
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'StartUpX',
    content: 'The best WhatsApp automation tool we\'ve used. The anti-ban protection gives us peace of mind while scaling our outreach.',
    rating: 5,
    avatar: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Sales Manager',
    company: 'GlobalSales',
    content: 'We\'ve increased our lead conversion by 40% since using WhatsFlow. The scheduling feature is a game-changer for global teams.',
    rating: 5,
    avatar: 'ER',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Businesses Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See why thousands of businesses trust WhatsFlow for their WhatsApp automation needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-whatsapp-green/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-whatsapp-green font-semibold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}