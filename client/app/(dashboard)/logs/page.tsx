'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadLogs(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLogs(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{logs.length} events recorded</p>
        </div>
        <Button variant="outline" icon={<Download className="h-5 w-5" />}>Export CSV</Button>
      </div>

      <div className="flex gap-2">
        {['all', 'api', 'webhook', 'error'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-whatsapp-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
            {f} {f !== 'all' && `(${logs.filter(l => l.type === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg">No logs found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Logs will appear here when API calls are made</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <Card key={log.id} className="p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                {log.status === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                 log.status === 'error' ? <XCircle className="h-4 w-4 text-red-500" /> :
                 <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                <div className="flex-1">
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{log.action}</span>
                  {log.details && <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">{log.details}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  log.type === 'error' ? 'bg-red-100 text-red-700' : 
                  log.type === 'webhook' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>{log.type}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
