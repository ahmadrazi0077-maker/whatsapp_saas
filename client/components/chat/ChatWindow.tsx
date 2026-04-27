'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { 
  PhoneIcon, 
  VideoCameraIcon, 
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Message, Contact } from '@/types/chat';

interface ChatWindowProps {
  chatId: string;
  socket: Socket | null;
  onBack?: () => void;
}

interface ContactInfo {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export default function ChatWindow({ chatId, socket, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMessages();
    fetchContact();
    markAsRead();
    
    if (socket) {
      socket.on('new-message', handleNewMessage);
      socket.on('typing', handleTyping);
      socket.on('messages-read', handleMessagesRead);
      
      return () => {
        socket.off('new-message');
        socket.off('typing');
        socket.off('messages-read');
      };
    }
  }, [chatId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/contacts/${chatId}`);
      const data = await response.json();
      setContact({
        id: data.id,
        name: data.name || data.phoneNumber,
        phoneNumber: data.phoneNumber,
        avatar: data.profilePic,
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
      });
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      // Set fallback contact
      setContact({
        id: chatId,
        name: 'Contact',
        phoneNumber: 'Unknown',
        isOnline: false,
      });
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/messages/read/${chatId}`, { method: 'POST' });
      if (socket) {
        socket.emit('mark-read', { chatId });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    // Check if message belongs to this conversation
    if (message.conversationId === chatId) {
      setMessages(prev => [...prev, message]);
      if (!message.fromMe) {
        markAsRead();
      }
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
  };

  const handleMessagesRead = ({ chatId: readChatId }: { chatId: string }) => {
    if (readChatId === chatId) {
      setMessages(prev =>
        prev.map(msg =>
          !msg.fromMe && msg.status !== 'read'
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: chatId,
      body: text,
      fromMe: true,
      timestamp: new Date(),
      status: 'sent',
      messageType: 'text',
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: text }),
      });
      
      const sentMessage = await response.json();
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? sentMessage : m));
      
      if (socket) {
        socket.emit('send-message', sentMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTypingIndicator = () => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping: true });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div className="relative">
            {contact?.avatar ? (
              <Image
                src={contact.avatar}
                alt={contact.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {contact?.name?.[0]?.toUpperCase() || contact?.phoneNumber?.[0] || '?'}
              </div>
            )}
            {contact?.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {contact?.name || contact?.phoneNumber}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contact?.isOnline 
                ? 'Online' 
                : contact?.lastSeen 
                  ? `Last seen ${formatDistanceToNow(contact.lastSeen, { addSuffix: true })}`
                  : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <PhoneIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <VideoCameraIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <EllipsisHorizontalIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTypingIndicator} />
    </div>
  );
}
