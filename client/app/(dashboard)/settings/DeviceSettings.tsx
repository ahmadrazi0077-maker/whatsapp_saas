'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ArrowPathIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Device {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected?: string;
  platform?: string;
}

export default function DeviceSettings() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
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
      setConnectingDevice('connecting');
      const response = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await response.json();
      
      if (data.qrCode) {
        setShowQRModal(true);
        setConnectingDevice(data.deviceId);
        
        const interval = setInterval(async () => {
          const statusRes = await fetch(`/api/whatsapp/status/${data.deviceId}`);
          const status = await statusRes.json();
          
          if (status.status === 'connected') {
            clearInterval(interval);
            setShowQRModal(false);
            toast.success('Device connected successfully!');
            fetchDevices();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to connect device:', error);
      toast.error('Failed to connect device');
    } finally {
      setConnectingDevice(null);
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to disconnect this device?')) return;
    
    try {
      await fetch(`/api/whatsapp/disconnect/${deviceId}`, { method: 'POST' });
      toast.success('Device disconnected');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to disconnect device');
    }
  };

  const reconnectDevice = async (deviceId: string) => {
    try {
      await fetch(`/api/whatsapp/reconnect/${deviceId}`, { method: 'POST' });
      toast.success('Reconnecting device...');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to reconnect device');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Connected</span>;
      case 'connecting':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Connecting...</span>;
      case 'error':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Error</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Disconnected</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading devices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">WhatsApp Devices</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your connected WhatsApp accounts</p>
        </div>
        <button
          onClick={connectDevice}
          disabled={!!connectingDevice}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Connect New Device
        </button>
      </div>
      
      {devices.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No devices connected</h3>
          <p className="text-gray-500 mb-4">Connect your first WhatsApp device to start messaging</p>
          <button
            onClick={connectDevice}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Connect Device
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map(device => (
            <div key={device.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{device.name || device.phoneNumber}</h3>
                    {getStatusBadge(device.status)}
                  </div>
                  <p className="text-sm text-gray-500">{device.phoneNumber}</p>
                  {device.lastConnected && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last seen: {new Date(device.lastConnected).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {device.status === 'connected' && (
                  <button
                    onClick={() => disconnectDevice(device.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
                {device.status === 'error' && (
                  <button
                    onClick={() => reconnectDevice(device.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scan QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
              </p>
              <div className="flex justify-center">
                <QrCodeIcon className="h-32 w-32 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Waiting for connection... This may take a few moments
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
