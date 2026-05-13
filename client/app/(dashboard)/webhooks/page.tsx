'use client';

import React, { useState } from 'react';
import { Send, Copy, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://whatsappsaas-production-f4eb.up.railway.app/api';

export default function WebhooksPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [testMessage, setTestMessage] = useState({ from: '+1234567890', body: 'Test message from webhook' });

  const webhookUrl = `${API_URL}/webhook/whatsapp`;

  const handleTest = async () => {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMessage),
      });
      const data = await res.json();
      setTestResult({ success: true, message: 'Webhook test sent! Response: ' + JSON.stringify(data) });
    } catch (err: any) {
      setTestResult({ success: false, message: 'Error: ' + err.message });
    }
    setTimeout(() => setTestResult(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-1">Configure and test webhook endpoints</p>
        </div>
      </div>

      {/* Webhook URL Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Your Webhook URL</h2>
        <div className="flex gap-2">
          <Input value={webhookUrl} readOnly className="font-mono text-sm flex-1" />
          <Button variant="outline" icon={<Copy className="h-4 w-4" />} 
            onClick={() => { navigator.clipboard.writeText(webhookUrl); alert('Copied!'); }}>
            Copy
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Use this URL in WhatsApp Business API or Twilio to receive incoming messages.
        </p>
      </Card>

      {/* Test Webhook */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Test Webhook</h2>
        <div className="space-y-4">
          <Input label="From (Phone Number)" value={testMessage.from} 
            onChange={e => setTestMessage({...testMessage, from: e.target.value})} />
          <Input label="Message Body" value={testMessage.body}
            onChange={e => setTestMessage({...testMessage, body: e.target.value})} />
          <Button onClick={handleTest} icon={<Send className="h-4 w-4" />}>Send Test Webhook</Button>
        </div>
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            testResult.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            <CheckCircle className="h-4 w-4" />
            {testResult.message}
          </div>
        )}
      </Card>
    </div>
  );
}
