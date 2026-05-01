'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DatabaseTestPage() {
  const [status, setStatus] = useState<string>('Testing...');
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      // Test 1: Check Supabase connection
      setStatus('Testing Supabase connection...');
      const { error: healthError } = await supabase.from('users').select('id', { count: 'exact', head: true });
      
      if (healthError) throw new Error(`Connection failed: ${healthError.message}`);
      setResults(prev => ({ ...prev, connection: '✅ Supabase connected successfully' }));

      // Test 2: Check users table
      setStatus('Checking users table...');
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw new Error(`Users table error: ${usersError.message}`);
      setResults(prev => ({ ...prev, users: `✅ Users table exists (${usersCount || 0} records)` }));

      // Test 3: Check workspaces table
      setStatus('Checking workspaces table...');
      const { count: workspacesCount, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*', { count: 'exact', head: true });
      
      if (workspacesError) throw new Error(`Workspaces table error: ${workspacesError.message}`);
      setResults(prev => ({ ...prev, workspaces: `✅ Workspaces table exists (${workspacesCount || 0} records)` }));

      // Test 4: Check contacts table
      setStatus('Checking contacts table...');
      const { count: contactsCount, error: contactsError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });
      
      if (contactsError) throw new Error(`Contacts table error: ${contactsError.message}`);
      setResults(prev => ({ ...prev, contacts: `✅ Contacts table exists (${contactsCount || 0} records)` }));

      // Test 5: Check devices table
      setStatus('Checking devices table...');
      const { count: devicesCount, error: devicesError } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true });
      
      if (devicesError) throw new Error(`Devices table error: ${devicesError.message}`);
      setResults(prev => ({ ...prev, devices: `✅ Devices table exists (${devicesCount || 0} records)` }));

      // Test 6: Check messages table
      setStatus('Checking messages table...');
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
      
      if (messagesError) throw new Error(`Messages table error: ${messagesError.message}`);
      setResults(prev => ({ ...prev, messages: `✅ Messages table exists (${messagesCount || 0} records)` }));

      // Test 7: Check conversations table
      setStatus('Checking conversations table...');
      const { count: conversationsCount, error: conversationsError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });
      
      if (conversationsError) throw new Error(`Conversations table error: ${conversationsError.message}`);
      setResults(prev => ({ ...prev, conversations: `✅ Conversations table exists (${conversationsCount || 0} records)` }));

      setStatus('✅ All database tests passed!');
    } catch (err: any) {
      console.error('Database test failed:', err);
      setError(err.message);
      setStatus('❌ Database test failed');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <div className={`p-4 rounded-lg mb-6 ${status.includes('✅') ? 'bg-green-100 text-green-800' : status.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
        <strong>Status:</strong> {status}
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="space-y-2">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            {value as string}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h2 className="font-semibold mb-2">Next Steps:</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Make sure you've run all the SQL schema</li>
          <li>Create a test user in the users table</li>
          <li>Test the API endpoints using the test page below</li>
        </ol>
      </div>
    </div>
  );
}
