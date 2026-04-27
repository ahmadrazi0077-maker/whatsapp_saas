'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Device {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected?: string;
  platform?: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Business Phone',
      phoneNumber: '+92 300 1234567',
      status: 'connected',
      lastConnected: new Date().toISOString(),
      platform: 'android',
    },
  ]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectDevice = async () => {
    setLoading(true);
    setShowQRModal(true);
    setConnectingDevice('connecting');
    
    // Simulate connection
    setTimeout(() => {
      setDevices([
        ...devices,
        {
          id: Date.now().toString(),
          name: 'New Device',
          phoneNumber: '+92 300 9876543',
          status: 'connected',
          lastConnected: new Date().toISOString(),
          platform: 'ios',
        },
      ]);
      setShowQRModal(false);
      setConnectingDevice(null);
      setLoading(false);
      toast.success('Device connected successfully!');
    }, 3000);
  };

  const disconnectDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to disconnect this device?')) return;
    
    setDevices(devices.filter(d => d.id !== deviceId));
    toast.success('Device disconnected');
  };

  const reconnectDevice = async (deviceId: string) => {
    toast.loading('Reconnecting...');
    setTimeout(() => {
      toast.success('Device reconnected');
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">Connected</span>;
      case 'connecting':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs">Connecting...</span>;
      case 'error':
        return <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">Error</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 rounded-full text-xs">Disconnected</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Devices</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your connected WhatsApp accounts</p>
        </div>
        <button
          onClick={connectDevice}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Connect New Device
        </button>
      </div>
      
      {devices.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <DevicePhoneMobileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No devices connected</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Connect your first WhatsApp device to start messaging</p>
          <button
            onClick={connectDevice}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
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
                      <h3 className="font-semibold text-gray-900 dark:text-white">{device.name || device.phoneNumber}</h3>
                      {getStatusBadge(device.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{device.phoneNumber}</p>
                    {device.lastConnected && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Last active: {new Date(device.lastConnected).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => reconnectDevice(device.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                    title="Reconnect"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => disconnectDevice(device.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                    title="Disconnect"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
              </p>
              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-32 h-32 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Waiting for connection... This may take a few moments
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
