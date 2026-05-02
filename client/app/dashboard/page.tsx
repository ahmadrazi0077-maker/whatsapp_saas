'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/auth/login');
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">WhatsApp SaaS</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Messages</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Contacts</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Connected Devices</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
