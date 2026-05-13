'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'success', title: 'Broadcast completed', message: 'Campaign "Summer Sale" sent to 500 contacts', time: '2 mins ago', read: false },
    { id: '2', type: 'warning', title: 'Limit approaching', message: 'You have used 80% of your monthly messages', time: '1 hour ago', read: false },
    { id: '3', type: 'info', title: 'New feature', message: 'Webhook support is now available for all plans', time: '3 hours ago', read: true },
    { id: '4', type: 'error', title: 'Device disconnected', message: 'iPhone 12 lost connection. Check your device.', time: '5 hours ago', read: true },
  ]);

  const markAllRead = () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{notifications.filter(n => !n.read).length} unread</p>
        </div>
        <Button variant="outline" icon={<CheckCheck className="h-4 w-4" />} onClick={markAllRead}>Mark All Read</Button>
      </div>

      <div className="space-y-2">
        {notifications.map(notif => (
          <Card key={notif.id} className={`p-4 ${!notif.read ? 'border-l-4 border-l-whatsapp-green bg-green-50/30' : ''}`}>
            <div className="flex gap-3">
              {getIcon(notif.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notif.message}</p>
              </div>
              {!notif.read && <span className="w-2 h-2 bg-whatsapp-green rounded-full mt-2" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
