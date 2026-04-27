'use client';

import React, { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, UsersIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface BroadcastFormProps {
  onSuccess?: () => void;
}

export default function BroadcastForm({ onSuccess }: BroadcastFormProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [broadcastLists, setBroadcastLists] = useState<any[]>([]);

  useEffect(() => {
    fetchContacts();
    fetchBroadcastLists();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const fetchBroadcastLists = async () => {
    try {
      const response = await fetch('/api/broadcast/lists');
      const data = await response.json();
      setBroadcastLists(data);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (selectedContacts.length === 0 && !selectedList) {
      toast.error('Please select at least one contact or list');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload: any = {
        message,
        contacts: selectedContacts,
        listId: selectedList || undefined,
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
        setSelectedContacts([]);
        setSelectedList('');
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

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Select Recipients */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <UsersIcon className="h-5 w-5" />
          Select Recipients
        </h3>
        
        {/* Broadcast Lists */}
        {broadcastLists.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select a List</label>
            <div className="space-y-2">
              {broadcastLists.map(list => (
                <label key={list.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="recipientType"
                    checked={selectedList === list.id}
                    onChange={() => {
                      setSelectedList(list.id);
                      setSelectedContacts([]);
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{list.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{list.contactCount} contacts</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Individual Contacts */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Or Select Individual Contacts</label>
          <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {contacts.map(contact => (
              <label key={contact.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{contact.name || contact.phoneNumber}</p>
                  {contact.name && <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phoneNumber}</p>}
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Selected: {selectedList ? `List (${broadcastLists.find(l => l.id === selectedList)?.contactCount} contacts)` : `${selectedContacts.length} contacts`}
        </p>
      </div>
      
      {/* Message */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Message Content</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Type your broadcast message here... Use {name} to personalize"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Tip: Use {'{name}'} to insert the contact's name
        </p>
      </div>
      
      {/* Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Schedule</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              value="now"
              checked={scheduleType === 'now'}
              onChange={() => setScheduleType('now')}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Send now</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="radio"
              value="later"
              checked={scheduleType === 'later'}
              onChange={() => setScheduleType('later')}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Schedule for later</span>
          </label>
          
          {scheduleType === 'later' && (
            <div className="flex gap-4 ml-6">
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
      
      {/* Submit */}
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
