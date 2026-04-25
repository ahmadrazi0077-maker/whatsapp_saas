'use client';

import React, { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Device {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'connecting';
}

export default function DeviceSettings() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
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

  const connectDevice = async () => {
    try {
      const response = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await response.json();
      toast.success('Device connecting...');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to connect device');
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      await fetch(`/api/whatsapp/disconnect/${deviceId}`, { method: 'POST' });
      toast.success('Device disconnected');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to disconnect device');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      connecting: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading devices...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">WhatsApp Devices</h2>
        <button
          onClick={connectDevice}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Connect Device
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <DevicePhoneMobileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No devices connected</p>
          <button
            onClick={connectDevice}
            className="mt-4 text-blue-600 hover:underline"
          >
            Connect your first device
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{device.name || device.phoneNumber}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(device.status)}`}>
                    {device.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{device.phoneNumber}</p>
              </div>
              {device.status === 'connected' && (
                <button
                  onClick={() => disconnectDevice(device.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
