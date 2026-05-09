'use client';

import React, { useState } from 'react';


import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">Contact Us</h1>
          <p className="text-gray-500 text-center mb-16">Have questions? We'd love to hear from you.</p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Mail, title: 'Email', info: 'support@whatsflow.com', sub: 'We reply within 24 hours' },
              { icon: Phone, title: 'Phone', info: '+1 (555) 123-4567', sub: 'Mon-Fri 9am-6pm EST' },
              { icon: MapPin, title: 'Office', info: '123 Tech Street', sub: 'Silicon Valley, CA 94025' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center p-6 bg-white rounded-xl shadow-sm border">
                  <Icon className="h-8 w-8 text-whatsapp-green mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.info}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h2>
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900">Message Sent!</p>
                <p className="text-gray-500">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <Input label="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                </div>
                <Button type="submit" icon={<Send className="h-4 w-4" />}>Send Message</Button>
              </form>
            )}
          </div>
        </div>
      </div>
      
    </>
  );
}

