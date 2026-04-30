'use client';

import { useEffect, useState } from 'react';
import { contactsApi, devicesApi, messagesApi, broadcastApi } from '@/lib/supabaseApi';

export default function TestAPIPage() {
  const [results, setResults] = useState<any>({});

  useEffect(() => {
    const testAPIs = async () => {
      const results: any = {};
      
      try {
        const contacts = await contactsApi.getAll();
        results.contacts = { success: true, count: contacts.length };
      } catch (e: any) {
        results.contacts = { success: false, error: e.message };
      }
      
      try {
        const devices = await devicesApi.getAll();
        results.devices = { success: true, count: devices.length };
      } catch (e: any) {
        results.devices = { success: false, error: e.message };
      }
      
      try {
        const conversations = await messagesApi.getConversations();
        results.messages = { success: true, count: conversations.length };
      } catch (e: any) {
        results.messages = { success: false, error: e.message };
      }
      
      try {
        const campaigns = await broadcastApi.getCampaigns();
        results.broadcast = { success: true, count: campaigns.length };
      } catch (e: any) {
        results.broadcast = { success: false, error: e.message };
      }
      
      setResults(results);
    };
    
    testAPIs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
