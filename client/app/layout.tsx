'use client';

import type { Metadata } from 'next';
import './globals.css';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const publicPaths = ['/', '/login', '/register'];
    
    if (!token && !publicPaths.includes(pathname) && pathname.startsWith('/dashboard')) {
      router.push('/login');
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}