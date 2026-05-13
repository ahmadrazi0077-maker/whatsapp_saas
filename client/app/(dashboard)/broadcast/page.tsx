'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Plus, Send, Link, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
<<<<<<< HEAD
const API_URL = '${process.env.NEXT_PUBLIC_API_URL}';
=======
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
>>>>>>> 984d5a8205ee3e6ea073c4bbafde4a7ee7130099
export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBroadcast, setShowNewBroadcast] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({ name: '', message: '', recipients: '' });

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const data: any = await api.broadcast.getAll();
      setBroadcasts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };

  const [plan, setPlan] = useState<string>('free');

useEffect(() => {
  const token = localStorage.getItem('token');
  fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json())
    .then(d => { if (d.success) setPlan(d.data.plan); });
}, []);

  const handleCreateAndSend = async () => {
    try {
      const recipients = newBroadcast.recipients.split(',').map(r => r.trim()).filter(Boolean);
      const broadcast: any = await api.broadcast.create({
        name: newBroadcast.name,
        message: newBroadcast.message,
        recipients,
      });
      await api.broadcast.send(broadcast.id);
      setShowNewBroadcast(false);
      setNewBroadcast({ name: '', message: '', recipients: '' });
      loadBroadcasts();
    } catch (error) {
      console.error('Failed to create broadcast');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Broadcast</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Create and manage broadcast campaigns</p>
        </div>
       {plan === 'free' || plan === 'starter' ? (
  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Broadcast messaging is available on Pro plan and above.</p>
    <Link href="/dashboard/upgrade">
      <Button size="sm" icon={<Crown className="h-4 w-4" />}>Upgrade to Pro</Button>
    </Link>
  </div>
) : (
  <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowNewBroadcast(true)}>
    New Broadcast
  </Button>
)}
      </div>

      {showNewBroadcast && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Broadcast</h2>
          <div className="space-y-4">
            <Input
              label="Broadcast Name"
              value={newBroadcast.name}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Message</label>
              <textarea
                rows={4}
                value={newBroadcast.message}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 dark:text-white focus:border-whatsapp-green focus:ring-2 focus:ring-whatsapp-green/20"
              />
            </div>
            <Input
              label="Recipients (comma-separated phone numbers)"
              value={newBroadcast.recipients}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, recipients: e.target.value })}
            />
            <div className="flex space-x-2">
              <Button onClick={handleCreateAndSend} icon={<Send className="h-5 w-5" />}>
                Send Now
              </Button>
              <Button variant="ghost" onClick={() => setShowNewBroadcast(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {broadcasts.map((broadcast: any) => (
          <Card key={broadcast.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{broadcast.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{broadcast.message}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                broadcast.status === 'sent' ? 'bg-green-100 text-green-700' :
                broadcast.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                broadcast.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}>
                {broadcast.status}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{broadcast.recipients?.length || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Recipients</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{broadcast.stats?.sent || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{broadcast.stats?.delivered || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{broadcast.stats?.failed || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Failed</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
