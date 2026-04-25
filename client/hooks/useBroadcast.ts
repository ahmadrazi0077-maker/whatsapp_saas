'use client';

import { useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  message: string;
  sentCount: number;
  totalRecipients: number;
}

export function useBroadcast() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const createCampaign = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/broadcast/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const campaign = await response.json();
      setCampaigns([campaign, ...campaigns]);
      return campaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
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

  const cancelCampaign = async (campaignId: string) => {
    try {
      await fetch(`/api/broadcast/cancel/${campaignId}`, { method: 'POST' });
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, status: 'cancelled' } : c
      ));
    } catch (error) {
      console.error('Failed to cancel campaign:', error);
      throw error;
    }
  };

  return { campaigns, loading, createCampaign, fetchCampaigns, cancelCampaign };
}
