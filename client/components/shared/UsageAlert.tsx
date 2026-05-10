'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const API_URL = '${process.env.NEXT_PUBLIC_API_URL}';

export function UsageAlert() {
  const [usage, setUsage] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsage(data.data);
    } catch (err) {}
  };

  if (!usage || dismissed) return null;

  const { messagesPercent, messagesSent, messagesLimit, isNearLimit, isAtLimit } = usage;

  if (!isNearLimit && !isAtLimit) return null;

  const bgColor = isAtLimit ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300';
  const textColor = isAtLimit ? 'text-red-700' : 'text-yellow-700';
  const iconColor = isAtLimit ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className={`${bgColor} border rounded-xl p-4 mb-4 flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
        <div>
          <p className={`font-semibold text-sm ${textColor}`}>
            {isAtLimit ? '🚫 Message limit reached!' : '⚠️ Approaching message limit!'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {messagesSent.toLocaleString()} / {messagesLimit === Infinity ? '∞' : messagesLimit.toLocaleString()} messages used ({messagesPercent}%)
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a href="/dashboard/upgrade">
          <Button size="sm" icon={<Zap className="h-4 w-4" />}>
            Upgrade Plan
          </Button>
        </a>
        <button onClick={() => setDismissed(true)} className="p-1 hover:bg-black/5 rounded">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}