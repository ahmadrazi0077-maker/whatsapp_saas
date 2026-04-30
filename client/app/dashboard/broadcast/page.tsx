'use client';

import { useState, useEffect } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { broadcastApi, contactsApi } from '@/lib/supabaseApi';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  scheduled_for: string;
  sent_count: number;
  total_recipients: number;
  created_at: string;
}

export default function BroadcastPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await broadcastApi.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await broadcastApi.create({
        name: campaignName || `Broadcast ${new Date().toLocaleDateString()}`,
        message,
      });
      toast.success('Broadcast created successfully');
      setMessage('');
      setCampaignName('');
      setShowForm(false);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to create broadcast');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Send bulk messages to your contacts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          New Broadcast
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Create Broadcast</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name (Optional)</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Summer Sale 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message *</label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Type your broadcast message here..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Creating...' : 'Create Broadcast'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Campaigns</h2>
        {campaigns.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <EnvelopeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No campaigns yet</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{campaign.message}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Recipients: {campaign.total_recipients}</span>
                <span>Sent: {campaign.sent_count}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
    case 'SENDING': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
