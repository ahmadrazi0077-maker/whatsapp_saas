'use client';

import { useState } from 'react';

export default function APITestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      let data;
      try {
        data = await response.json();
      } catch {
        data = { error: 'Could not parse JSON response' };
      }
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          time: `${endTime - startTime}ms`,
          data: data
        }
      }));
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        [name]: { error: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => testEndpoint('Health Check', '/api/health')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading['Health Check']}
        >
          {loading['Health Check'] ? 'Testing...' : 'Test Health Check'}
        </button>
        
        <button
          onClick={() => testEndpoint('Contacts API', '/api/contacts')}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          disabled={loading['Contacts API']}
        >
          {loading['Contacts API'] ? 'Testing...' : 'Test Contacts API'}
        </button>
        
        <button
          onClick={() => testEndpoint('Devices API', '/api/devices')}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
          disabled={loading['Devices API']}
        >
          {loading['Devices API'] ? 'Testing...' : 'Test Devices API'}
        </button>
        
        <button
          onClick={() => testEndpoint('Conversations API', '/api/messages/conversations')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading['Conversations API']}
        >
          {loading['Conversations API'] ? 'Testing...' : 'Test Conversations API'}
        </button>
      </div>
      
      <div className="space-y-4">
        {Object.entries(results).map(([key, result]) => (
          <div key={key} className="border rounded-lg p-4">
            <h2 className="font-bold text-lg mb-2">{key}</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
      
      {Object.keys(results).length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Click any button above to test the API endpoints
        </div>
      )}
    </div>
  );
}
