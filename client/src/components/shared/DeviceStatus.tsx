'use client';

import { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

export default function DeviceStatus() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/whatsapp/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {devices.length === 0 ? (
        <p className="text-gray-500 text-sm">No devices connected</p>
      ) : (
        devices.map((device: any) => (
          <div key={device.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(device.status)}
              <span className="text-sm font-medium">{device.phoneNumber || 'WhatsApp Device'}</span>
            </div>
            <span className="text-xs text-gray-500">
              {device.status === 'connected' ? 'Active' : device.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}