'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Wifi, WifiOff, Trash2, QrCode, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://whatsapp-saas-tftc.onrender.com/api';

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [newDevice, setNewDevice] = useState({ name: '', phoneNumber: '' });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadDevices(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadDevices = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDevices(data.data || []);
    } catch (err) { setError('Failed to fetch devices'); }
    finally { setLoading(false); }
  };

const handleConnect = async () => {
  if (!newDevice.name || !newDevice.phoneNumber) {
    setError('Please fill all fields'); return;
  }
  setConnecting(true);
  setError('');
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/devices/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newDevice),
    });
    const data = await res.json();
    if (data.success) {
      setSelectedDevice(data.data);
      setShowConnect(false);
      setShowQR(true);
      setNewDevice({ name: '', phoneNumber: '' });
      
      // Auto-refresh QR every 1 second until connected
      const qrInterval = setInterval(async () => {
        try {
          const qrRes = await fetch(`${API_URL}/devices/${data.data.id}/qr`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const qrData = await qrRes.json();
          if (qrData.success && qrData.data.qrDataUrl) {
            setSelectedDevice((prev: any) => ({ ...prev, qrDataUrl: qrData.data.qrDataUrl }));
          }
          
          // Check device status
          const statusRes = await fetch(`${API_URL}/devices/${data.data.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const statusData = await statusRes.json();
          if (statusData.success && statusData.data.status === 'connected') {
            clearInterval(qrInterval);
            setSuccess('Device connected successfully!');
            setTimeout(() => setShowQR(false), 2000);
            loadDevices();
          }
        } catch (e) {}
      }, 2000);
      
    } else {
      setError(data.error || 'Failed to connect');
    }
  } catch (err) { setError('Connection failed'); }
  finally { setConnecting(false); }
};

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this device?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/devices/${id}/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Device disconnected');
      loadDevices();
    } catch (err) { setError('Failed to disconnect'); }
  };

  const handleRefreshQR = async () => {
    if (!selectedDevice) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/devices/${selectedDevice.id}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedDevice({ ...selectedDevice, qrDataUrl: data.data.qrDataUrl });
      }
    } catch (err) { setError('Failed to refresh QR'); }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="h-12 w-12 text-whatsapp-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600 mt-1">{devices.length} device{devices.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowConnect(true)}>Connect Device</Button>
      </div>

      {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Connect Modal */}
      {showConnect && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Connect WhatsApp Device</h2>
          <div className="space-y-4 max-w-md">
            <Input label="Device Name" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} placeholder="e.g., iPhone 15" />
            <Input label="Phone Number" value={newDevice.phoneNumber} onChange={e => setNewDevice({...newDevice, phoneNumber: e.target.value})} placeholder="+1234567890" />
            <p className="text-xs text-gray-500">After connecting, scan the QR code with WhatsApp on your phone.</p>
            <div className="flex gap-2">
              <Button onClick={handleConnect} loading={connecting}>Connect</Button>
              <Button variant="ghost" onClick={() => setShowConnect(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* QR Modal */}
      {showQR && selectedDevice && (
        <Card className="p-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Scan QR Code</h2>
            <button onClick={() => setShowQR(false)}><X className="h-5 w-5" /></button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Open WhatsApp on <strong>{selectedDevice.phoneNumber}</strong> → Settings → Linked Devices → Link a Device
          </p>
          {selectedDevice.qrDataUrl ? (
            <img src={selectedDevice.qrDataUrl} alt="QR Code" className="mx-auto w-48 h-48 border-2 border-green-500 rounded-lg" />
          ) : (
            <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto" />
          )}
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={handleRefreshQR}>Refresh QR</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowQR(false)}>Close</Button>
          </div>
        </Card>
      )}

      {/* Devices Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(device => (
          <Card key={device.id} className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${device.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Smartphone className={`h-5 w-5 ${device.status === 'connected' ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-500">{device.phoneNumber}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                device.status === 'connected' ? 'bg-green-100 text-green-700' : 
                device.status === 'connecting' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {device.status === 'connected' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {device.status}
              </span>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t">
              {device.status === 'connecting' && (
                <Button size="sm" variant="outline" onClick={() => { setSelectedDevice(device); setShowQR(true); }}>Show QR</Button>
              )}
              <Button size="sm" variant="danger" icon={<WifiOff className="h-4 w-4" />} onClick={() => handleDisconnect(device.id)}>Disconnect</Button>
            </div>
          </Card>
        ))}
        {devices.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <Smartphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No devices connected yet</p>
            <Button className="mt-3" onClick={() => setShowConnect(true)}>Connect First Device</Button>
          </div>
        )}
      </div>
    </div>
  );
}
