export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface Chat {
  id: string;
  phoneNumber: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  avatar?: string;
  status: 'online' | 'offline' | 'typing';
  tags: string[];
}

export interface Message {
  id: string;
  chatId: string;
  sender: 'me' | 'contact';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'video' | 'document' | 'audio';
  mediaUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
}

export interface Device {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'connecting';
  battery?: number;
  lastSeen: Date;
}

export interface Broadcast {
  id: string;
  name: string;
  message: string;
  recipients: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
}