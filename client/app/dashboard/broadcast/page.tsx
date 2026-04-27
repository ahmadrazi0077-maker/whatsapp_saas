'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon, 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  recipients: number;
  sent: number;
  scheduledFor?: Date;
  createdAt: Date;
}

export default function BroadcastPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'campaigns'>('create');
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Summer Sale',
      message: 'Get 50% off on all products! Use code SUMMER50',
      status: 'completed',
      recipients: 150,
      sent: 150,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Welcome Message',
      message: 'Welcome to our WhatsApp community!',
      status: 'scheduled',
      recipients: 50,
      sent: 0,
      scheduledFor: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    scheduleType: 'now' as 'now' | 'later',
    scheduledDate: '',
    scheduledTime: '',
    recipients: 'all' as 'all' | 'selected',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: formData.name || `Broadcast ${campaigns.length + 1}`,
        message: formData.message,
        status: formData.scheduleType === 'now' ? 'sending' : 'scheduled',
        recipients: 100,
        sent: 0,
        scheduledFor: formData.scheduleType === 'later' ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`) : undefined,
        createdAt: new Date(),
      };
      setCampaigns([newCampaign, ...campaigns]);
      setFormData({
        name: '',
        message: '',
        scheduleType: 'now',
        scheduledDate: '',
        scheduledTime: '',
        recipients: 'all',
      });
      toast.success(formData.scheduleType === 'now' ? 'Broadcast sent successfully!' : 'Broadcast scheduled successfully!');
      setActiveTab('campaigns');
      setLoading(false);
    }, 1500);
  };

  const cancelCampaign = (id: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: 'cancelled' } : c
    ));
    toast.success('Campaign cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'sending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Send bulk messages to your contacts</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Create Broadcast
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'campaigns'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Campaigns
          </button>
        </nav>
      </div>

      {activeTab === 'create' ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6"
        >
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign Name (Optional)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Summer Sale 2024"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message *
            </label>
            <textarea
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Type your broadcast message here... Use {name} to personalize"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tip: Use {'{name}'} to insert the contact's name
            </p>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipients
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="all"
                  checked={formData.recipients === 'all'}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value as any })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">All Contacts</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="selected"
                  checked={formData.recipients === 'selected'}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value as any })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Select Specific Contacts</span>
              </label>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="now"
                  checked={formData.scheduleType === 'now'}
                  onChange={() => setFormData({ ...formData, scheduleType: 'now' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Send now</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="later"
                  checked={formData.scheduleType === 'later'}
                  onChange={() => setFormData({ ...formData, scheduleType: 'later' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Schedule for later</span>
              </label>
            </div>
            
            {formData.scheduleType === 'later' && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData
