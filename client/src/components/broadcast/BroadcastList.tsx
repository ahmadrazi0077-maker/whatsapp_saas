'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChartBarIcon, PauseIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  message: string;
  scheduledFor?: string;
  sentCount: number;
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  createdAt: string;
}

export default function BroadcastList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/broadcast/campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'scheduled': return 'Scheduled';
      case 'sending': return 'Sending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const cancelCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to cancel this broadcast?')) return;
    
    try {
      await fetch(`/api/broadcast/cancel/${campaignId}`, { method: 'POST' });
      toast.success('Broadcast cancelled');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to cancel broadcast');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No broadcasts yet</h3>
        <p className="text-gray-500">Create your first broadcast campaign</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map(campaign => (
        <div key={campaign.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{campaign.name || `Broadcast ${format(new Date(campaign.createdAt), 'MMM d, yyyy')}`}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
                {campaign.scheduledFor && (
                  <span className="text-xs text-gray-500">
                    Scheduled for {format(new Date(campaign.scheduledFor), 'MMM d, yyyy h:mm a')}
                  </span>
                )}
              </div>
            </div>
            
            {campaign.status === 'scheduled' && (
              <button
                onClick={() => cancelCampaign(campaign.id)}
                className="p-2 hover:bg-red-100 rounded-full transition text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-2">{campaign.message}</p>
          
          {campaign.status === 'sending' || campaign.status === 'completed' ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">
                  {campaign.sentCount} / {campaign.totalRecipients}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${(campaign.sentCount / campaign.totalRecipients) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold">{campaign.sentCount}</p>
                  <p className="text-xs text-gray-500">Sent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.deliveredCount}</p>
                  <p className="text-xs text-gray-500">Delivered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.readCount}</p>
                  <p className="text-xs text-gray-500">Read</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-2xl font-bold">{campaign.totalRecipients}</p>
                <p className="text-xs text-gray-500">Recipients</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{format(new Date(campaign.createdAt), 'MMM d')}</p>
                <p className="text-xs text-gray-500">Created</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
