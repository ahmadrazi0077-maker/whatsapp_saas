'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useWhatsApp() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

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
    setConnecting(true);
    try {
      const response = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await response.json();
      
      if (data.qrCode) {
        return data;
      }
    } catch (error) {
      toast.error('Failed to connect device');
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      await fetch(`/api/whatsapp/disconnect/${deviceId}`, { method: 'POST' });
      toast.success('Device disconnected');
      await fetchDevices();
    } catch (error) {
      toast.error('Failed to disconnect device');
    }
  };

  const sendMessage = async (deviceId: string, to: string, message: string) => {
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, to, message }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    }
  };

  return {
    devices,
    loading,
    connecting,
    connectDevice,
    disconnectDevice,
    sendMessage,
    refreshDevices: fetchDevices,
  };
}