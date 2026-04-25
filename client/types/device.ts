export interface Device {
  id: string;
  name: string;
  phoneNumber: string;
  platform?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qrCode?: string;
  lastConnected?: Date;
  lastDisconnected?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceStatus {
  deviceId: string;
  status: Device['status'];
  connectionStrength?: number;
  lastPing?: Date;
}