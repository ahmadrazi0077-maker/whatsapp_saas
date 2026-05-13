'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Send, Trash2, Copy, Calendar, Clock, Loader2, Play, Users, Search, X, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const API_URL = '${process.env.NEXT_PUBLIC_API_URL}';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Contact selection states
  const [existingContacts, setExistingContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactInputMethod, setContactInputMethod] = useState<'manual' | 'select' | 'csv'>('manual');
  const [manualNumbers, setManualNumbers] = useState('');
  const [csvText, setCsvText] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showContactList, setShowContactList] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    name: '', message: '', scheduledAt: ''
  });

  useEffect(() => { 
    loadCampaigns(); 
    loadExistingContacts();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCampaigns(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadExistingContacts = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setExistingContacts(data.data || []);
    } catch (err) { console.error(err); }
  };

  // Get all recipients based on input method
  const getAllRecipients = (): string[] => {
    if (contactInputMethod === 'manual') {
      return manualNumbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    }
    if (contactInputMethod === 'csv') {
      const lines = csvText.split('\n').filter(Boolean);
      return lines.map(line => {
        const parts = line.split(/[,\t]+/);
        return parts[0]?.trim(); // First column is phone number
      }).filter(Boolean);
    }
    if (contactInputMethod === 'select') {
      return selectedContacts;
    }
    return [];
  };

  const handleCreate = async () => {
    const recipients = getAllRecipients();
    
    if (!newCampaign.name || !newCampaign.message) {
      setError('Name and message are required'); return;
    }
    if (recipients.length === 0) {
      setError('Please add at least one recipient'); return;
    }
    
    setSaving(true);
    try {
      const token = getToken();
      await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newCampaign.name,
          message: newCampaign.message,
          recipients,
          scheduledAt: newCampaign.scheduledAt || null,
        }),
      });
      setNewCampaign({ name: '', message: '', scheduledAt: '' });
      setManualNumbers('');
      setCsvText('');
      setSelectedContacts([]);
      setShowNew(false);
      setSuccess(`Campaign created with ${recipients.length} recipients!`);
      setTimeout(() => setSuccess(''), 3000);
      loadCampaigns();
    } catch (err) { setError('Failed to create campaign'); }
    finally { setSaving(false); }
  };

  const toggleContact = (phone: string) => {
    setSelectedContacts(prev => 
      prev.includes(phone) ? prev.filter(c => c !== phone) : [...prev, phone]
    );
  };

  const selectAllContacts = () => {
    const filtered = existingContacts.filter(c => 
      c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.phoneNumber?.includes(contactSearch)
    );
    const allPhones = filtered.map(c => c.phoneNumber);
    setSelectedContacts(prev => 
      prev.length === allPhones.length ? [] : allPhones
    );
  };

  const handleSend = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/campaigns/${id}/send`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Campaign sent!');
      setTimeout(() => setSuccess(''), 3000);
      loadCampaigns();
    } catch (err) { setError('Failed to send'); }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/campaigns/${id}/duplicate`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Campaign duplicated!');
      setTimeout(() => setSuccess(''), 3000);
      loadCampaigns();
    } catch (err) { setError('Failed to duplicate'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/campaigns/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Deleted');
      setTimeout(() => setSuccess(''), 3000);
      loadCampaigns();
    } catch (err) { setError('Failed to delete'); }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
      scheduled: 'bg-yellow-100 text-yellow-700',
      sending: 'bg-blue-100 text-blue-700',
      sent: 'bg-green-100 text-green-700',
    };
    return styles[status] || styles.draft;
  };

  const recipients = getAllRecipients();
  const filteredContacts = existingContacts.filter(c => 
    c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.phoneNumber?.includes(contactSearch)
  );

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="h-12 w-12 text-whatsapp-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowNew(true)}>New Campaign</Button>
      </div>

      {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: campaigns.length },
          { label: 'Draft', value: campaigns.filter(c => c.status === 'draft').length },
          { label: 'Scheduled', value: campaigns.filter(c => c.status === 'scheduled').length },
          { label: 'Sent', value: campaigns.filter(c => c.status === 'sent').length },
        ].map(stat => (
          <Card key={stat.label} className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* New Campaign Form */}
      {showNew && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create Campaign</h2>
          <div className="space-y-4">
            <Input label="Campaign Name" value={newCampaign.name} 
              onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} 
              placeholder="e.g., Summer Sale 2024" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Message</label>
              <textarea rows={4} value={newCampaign.message} 
                onChange={e => setNewCampaign({...newCampaign, message: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Type your campaign message..." />
            </div>

            {/* Contact Input Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Recipients</label>
              
              {/* Method Tabs */}
              <div className="flex gap-2 mb-3">
                {[
                  { id: 'manual', label: 'Manual Entry', icon: Users },
                  { id: 'select', label: 'Select Contacts', icon: Search },
                  { id: 'csv', label: 'Paste CSV', icon: Upload },
                ].map(method => {
                  const Icon = method.icon;
                  return (
                    <button key={method.id}
                      onClick={() => setContactInputMethod(method.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        contactInputMethod === method.id 
                          ? 'bg-whatsapp-green text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}>
                      <Icon className="h-3.5 w-3.5" /> {method.label}
                    </button>
                  );
                })}
              </div>

              {/* Manual Entry */}
              {contactInputMethod === 'manual' && (
                <div>
                  <textarea rows={3} value={manualNumbers}
                    onChange={e => setManualNumbers(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                    placeholder="Enter phone numbers (one per line or comma-separated):&#10;+1234567890&#10;+1987654321&#10;+1122334455" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{recipients.length} number(s) entered</p>
                </div>
              )}

              {/* Select from Contacts */}
              {contactInputMethod === 'select' && (
                <div>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search contacts..." value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {filteredContacts.length > 0 && (
                      <div className="px-3 py-2 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                        <button onClick={selectAllContacts} className="text-xs text-whatsapp-green font-medium hover:underline">
                          {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{selectedContacts.length} selected</span>
                      </div>
                    )}
                    {filteredContacts.map(contact => (
                      <div key={contact.id}
                        onClick={() => toggleContact(contact.phoneNumber)}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 border-b last:border-0 ${
                          selectedContacts.includes(contact.phoneNumber) ? 'bg-green-50' : ''
                        }`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedContacts.includes(contact.phoneNumber) ? 'bg-whatsapp-green border-whatsapp-green' : 'border-gray-300'
                        }`}>
                          {selectedContacts.includes(contact.phoneNumber) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{contact.phoneNumber}</p>
                        </div>
                      </div>
                    ))}
                    {filteredContacts.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center py-4">No contacts found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Paste CSV */}
              {contactInputMethod === 'csv' && (
                <div>
                  <textarea rows={4} value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-mono"
                    placeholder="Paste CSV data (first column = phone number):&#10;+1234567890,John,Doe&#10;+1987654321,Jane,Smith&#10;+1122334455,Bob,Wilson" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{recipients.length} number(s) parsed</p>
                </div>
              )}
            </div>

            <Input label="Schedule (optional)" type="datetime-local" value={newCampaign.scheduledAt}
              onChange={e => setNewCampaign({...newCampaign, scheduledAt: e.target.value})} />
            
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={saving} icon={<Send className="h-4 w-4" />}>
                {newCampaign.scheduledAt ? 'Schedule Campaign' : 'Save as Draft'}
              </Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg mb-4">No campaigns yet</p>
          <Button onClick={() => setShowNew(true)} icon={<Plus className="h-5 w-5" />}>Create First Campaign</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{campaign.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 line-clamp-2">{campaign.message}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  {campaign.status === 'draft' && (
                    <button onClick={() => handleSend(campaign.id)} className="p-2 hover:bg-green-50 rounded-lg" title="Send now">
                      <Play className="h-4 w-4 text-green-500" />
                    </button>
                  )}
                  <button onClick={() => handleDuplicate(campaign.id)} className="p-2 hover:bg-blue-50 rounded-lg" title="Duplicate">
                    <Copy className="h-4 w-4 text-blue-400" />
                  </button>
                  <button onClick={() => handleDelete(campaign.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mt-3 pt-3 border-t">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {campaign.recipients?.length || 0} recipients
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
                {campaign.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(campaign.scheduledAt).toLocaleString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
