cat > components/broadcast/BroadcastForm.tsx << 'EOF'
'use client';

import React, { useState, useEffect } from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface BroadcastFormProps {
  onSuccess?: () => void;
}

export default function BroadcastForm({ onSuccess }: BroadcastFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload: any = {
        message,
        scheduleType,
      };
      
      if (scheduleType === 'later' && scheduledDate && scheduledTime) {
        payload.scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
      }
      
      const response = await fetch('/api/broadcast/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast.success('Broadcast created successfully');
        setMessage('');
        onSuccess?.();
      } else {
        throw new Error('Failed to create broadcast');
      }
    } catch (error) {
      console.error('Broadcast creation failed:', error);
      toast.error('Failed to create broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <UsersIcon className="h-5 w-5" />
          Create Broadcast
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your broadcast message here..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Schedule</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="now"
                  checked={scheduleType === 'now'}
                  onChange={() => setScheduleType('now')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Send now</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="later"
                  checked={scheduleType === 'later'}
                  onChange={() => setScheduleType('later')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Schedule for later</span>
              </label>
            </div>
          </div>
          
          {scheduleType === 'later' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Creating Broadcast...' : 'Create Broadcast'}
      </button>
    </form>
  );
}
EOF
