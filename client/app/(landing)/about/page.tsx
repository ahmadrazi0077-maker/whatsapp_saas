import React from 'react';


import { Users, Target, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">About WhatsFlow</h1>
          <p className="text-xl text-gray-500 text-center mb-16 max-w-2xl mx-auto">
            Empowering businesses with intelligent WhatsApp automation since 2024.
          </p>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: Users, title: '10,000+', desc: 'Active Users', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Zap, title: '1M+', desc: 'Messages Sent', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: Target, title: '99.9%', desc: 'Uptime', color: 'text-purple-500', bg: 'bg-purple-50' },
              { icon: Heart, title: '4.9/5', desc: 'User Rating', color: 'text-red-500', bg: 'bg-red-50' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.desc} className="text-center">
                  <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.title}</div>
                  <div className="text-sm text-gray-500">{stat.desc}</div>
                </div>
              );
            })}
          </div>

          <div className="prose max-w-none space-y-6 text-gray-600 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <p>
              At WhatsFlow, we believe that business communication should be simple, efficient, and automated. 
              Our mission is to empower businesses of all sizes to leverage WhatsApp's massive reach with 
              intelligent automation tools.
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
            <p>
              Founded in 2024, WhatsFlow started as a simple WhatsApp bulk messaging tool. Today, we serve 
              over 10,000 businesses worldwide, processing millions of messages monthly through our platform.
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Our Values</h2>
            <ul className="list-disc pl-6">
              <li><strong>Simplicity</strong> - We make complex automation simple</li>
              <li><strong>Reliability</strong> - Your business depends on us, we never let you down</li>
              <li><strong>Security</strong> - Your data is safe with enterprise-grade encryption</li>
              <li><strong>Innovation</strong> - We continuously improve and add new features</li>
            </ul>
          </div>
        </div>
      </div>
      
    </>
  );
}

