export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  contactId?: string;
  body: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
  fromMe: boolean;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  readAt?: Date;
  deliveredAt?: Date;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactNumber: string;
  contactAvatar?: string;
  lastMessage?: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'archived' | 'resolved';
  assignedTo?: string;
  assignedToName?: string;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  name?: string;
  profilePic?: string;
  email?: string;
  company?: string;
  tags: string[];
  notes?: string;
  lastMessageAt?: Date;
  messageCount: number;
  isOnline?: boolean;
  lastSeen?: Date;
}