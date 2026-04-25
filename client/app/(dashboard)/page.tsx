'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={{ background: 'white', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', padding: '1rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>WhatsApp SaaS</h1>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Dashboard</h2>
          <p>Welcome to your WhatsApp SaaS dashboard!</p>
        </div>
      </main>
    </div>
  );
}
