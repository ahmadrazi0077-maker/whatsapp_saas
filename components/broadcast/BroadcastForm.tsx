'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface BroadcastFormProps {
  onSuccess?: () => void;
}

export default function BroadcastForm({ onSuccess }: BroadcastFormProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      // API call will go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Broadcast created successfully');
      setMessage('');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Type your broadcast message here..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Broadcast'}
      </button>
    </form>
  );
}
