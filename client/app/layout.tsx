'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React, { createContext, useContext, useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

// Simple Auth Provider directly in layout
const AuthContext = createContext(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Simple mock user for now
      setUser({ id: '1', name: 'User', email: 'user@example.com' });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    localStorage.setItem('token', 'mock-token');
    setUser({ id: '1', name: 'User', email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout } as any}>
      {children}
    </AuthContext.Provider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
