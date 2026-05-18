'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Send, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://whatsapp-saas-tftc.onrender.com/api';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: 'message.received,broadcast.sent' });

  useEffect(() => { loadWebhooks(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setWebhooks(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newWebhook.url) { setError('Please enter a URL'); return; }
    setSaving(true);
    try {
      const token = getToken();
      await fetch(`${API_URL}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          url: newWebhook.url,
          events: newWebhook.events.split(',').map((e: string) => e.trim()).filter(Boolean),
        }),
      });
      setNewWebhook({ url: '', events: 'message.received,broadcast.sent' });
      setShowNew(false);
      setSuccess('Webhook added!');
      setTimeout(() => setSuccess(''), 3000);
      loadWebhooks();
    } catch (err) { setError('Failed to create webhook'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/webhooks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Webhook deleted');
      setTimeout(() => setSuccess(''), 3000);
      loadWebhooks();
    } catch (err) { setError('Failed to delete'); }
  };

  const handleTest = async (url: string) => {
    setTestResult({ loading: true });
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) });
      setTestResult({ success: res.ok, message: res.ok ? `Success! Status: ${res.status}` : `Failed! Status: ${res.status}` });
    } catch (err: any) {
      setTestResult({ success: false, message: `Error: ${err.message}` });
    }
    setTimeout(() => setTestResult(null), 5000);
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{webhooks.length} endpoint{webhooks.length !== 1 ? 's' : ''} configured</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowNew(true)}>Add Webhook</Button>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      {testResult && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${testResult.loading ? 'bg-blue-50 text-blue-600' : testResult.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {testResult.loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {testResult.message}
        </div>
      )}

      {showNew && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Webhook Endpoint</h2>
          <div className="space-y-4">
            <Input label="Webhook URL" value={newWebhook.url} onChange={e => setNewWebhook({...newWebhook, url: e.target.value})} placeholder="https://your-app.com/webhook" />
            <Input label="Events (comma-separated)" value={newWebhook.events} onChange={e => setNewWebhook({...newWebhook, events: e.target.value})} placeholder="message.received,broadcast.sent" />
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={saving}>Save Webhook</Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {webhooks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg">No webhooks configured yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map(webhook => (
            <Card key={webhook.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="font-mono text-sm text-gray-900 dark:text-white">{webhook.url}</p>
                <div className="flex gap-1">
                  <button onClick={() => handleTest(webhook.url)} className="p-2 hover:bg-gray-100 dark:bg-gray-700 rounded-lg" title="Test webhook">
                    <Send className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(webhook.url)} className="p-2 hover:bg-gray-100 dark:bg-gray-700 rounded-lg" title="Copy URL">
                    <Copy className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(webhook.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Delete webhook">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(webhook.events || []).map((event: string) => (
                  <span key={event} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{event}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
