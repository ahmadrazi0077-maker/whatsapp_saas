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
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Broadcast...
              </>
            ) : (
              <>
                <EnvelopeIcon className="h-5 w-5" />
                Create Broadcast
              </>
            )}
          </button>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <EnvelopeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No campaigns yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Create your first broadcast campaign</p>
            </div>
          ) : (
            campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {campaign.name || `Campaign ${format(new Date(campaign.createdAt), 'MMM d, yyyy')}`}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                      {campaign.scheduledFor && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Scheduled for {format(new Date(campaign.scheduledFor), 'MMM d, yyyy h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {campaign.status === 'scheduled' && (
                    <button
                      onClick={() => cancelCampaign(campaign.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{campaign.message}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {campaign.sent} / {campaign.recipients}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2 transition-all"
                      style={{ width: `${(campaign.sent / campaign.recipients) * 100}%` }}
                    />
                  </div>
                </div>
                
                {campaign.status === 'sending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Sending in progress...
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
