'use client';

import React, { useState, useEffect } from 'react';
import { Key, Copy, RefreshCw, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://whatsapp-saas-tftc.onrender.com/api';

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => { loadApiKey(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadApiKey = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/auth/api-key`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApiKey(data.data?.apiKey || 'No API key generated');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRegenerate = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/auth/api-key/regenerate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setApiKey(data.data.apiKey);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    alert('API key copied!');
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="h-12 w-12 text-green-500 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your API access keys</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Your API Key</h2>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              readOnly
              className="w-full px-4 py-2.5 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button variant="outline" icon={<Copy className="h-4 w-4" />} onClick={handleCopy}>Copy</Button>
          <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={handleRegenerate}>Regenerate</Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Use this key to authenticate API requests. Keep it secret!
        </p>
      </Card>
    </div>
  );
}
