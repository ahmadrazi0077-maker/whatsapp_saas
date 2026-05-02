'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  workspaceId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  workspaceName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Mock login
    setTimeout(() => {
      setUser({
        id: '1',
        name: email.split('@')[0],
        email,
        role: 'USER',
        workspaceId: 'workspace_1'
      });
      localStorage.setItem('token', 'mock-token');
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setTimeout(() => {
      setUser({
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: 'USER',
        workspaceId: 'workspace_1'
      });
      localStorage.setItem('token', 'mock-token');
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
