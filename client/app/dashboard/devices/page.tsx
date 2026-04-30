'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { devicesApi } from '@/lib/supabaseApi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Device {
  id: string;
  name: string;
  phone_number: string;
  status: 'connected' | 'disconnected' | 'connecting';
  created_at: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const data = await devicesApi.getAll();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const connectDevice = async () => {
    setConnecting(true);
    try {
      const result = await devicesApi.connect();
      toast.success('Device connection initiated');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to connect device');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to disconnect this device?')) return;
    try {
      await devicesApi.disconnect(deviceId);
      toast.success('Device disconnected');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to disconnect device');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Connected</span>;
      case 'connecting':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Connecting...</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Disconnected</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Devices</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your connected WhatsApp accounts</p>
        </div>
        <button
          onClick={connectDevice}
          disabled={connecting}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          {connecting ? 'Connecting...' : 'Connect Device'}
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <DevicePhoneMobileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No devices connected</h3>
          <p className="text-gray-500 mb-4">Connect your first WhatsApp device to start messaging</p>
          <button onClick={connectDevice} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Connect Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                    <DevicePhoneMobileIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{device.name || 'WhatsApp Device'}</h3>
                      {getStatusBadge(device.status)}
                    </div>
                    {device.phone_number && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{device.phone_number}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Connected: {new Date(device.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {device.status === 'connected' && (
                  <button
                    onClick={() => disconnectDevice(device.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
