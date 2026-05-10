'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowUp } from 'lucide-react';
import Link from 'next/link';

const API_URL = '${process.env.NEXT_PUBLIC_API_URL}';

export function RateLimitBanner() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        if (result.data.messagesPercent >= 80 || result.data.contactsPercent >= 80) {
          setShow(true);
        }
      }
    } catch (err) {}
  };

  if (!show || !data) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">Resource Limit Warning</p>
            <p className="text-sm text-yellow-700">
              {data.messagesPercent >= 80 && `Messages: ${data.messagesPercent}% used`}
              {data.contactsPercent >= 80 && ` • Contacts: ${data.contactsPercent}% used`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/upgrade">
            <button className="text-sm bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 flex items-center gap-1">
              <ArrowUp className="h-3 w-3" /> Upgrade
            </button>
          </Link>
          <button onClick={() => setShow(false)} className="text-yellow-400 hover:text-yellow-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}