'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Socket } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { PaperClipIcon, PhoneIcon, VideoCameraIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
}

interface ChatWindowProps {
  chatId: string;
  socket: Socket | null;
}

export default function ChatWindow({ chatId, socket }: ChatWindowProps) {
  const { t } = useTranslation(['whatsapp']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMessages();
    fetchContact();
    
    if (socket) {
      socket.on('new-message', handleNewMessage);
      socket.on('typing', handleTyping);
      
      return () => {
        socket.off('new-message');
        socket.off('typing');
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
    }
  };

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/contacts/${chatId}`);
      const data = await response.json();
      setContact(data);
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleTyping = () => {
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
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

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {contact?.name?.[0]?.toUpperCase() || contact?.phoneNumber?.[0] || '?'}
            </div>
            {contact?.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{contact?.name || contact?.phoneNumber}</h3>
            <p className="text-xs text-gray-500">
              {contact?.isOnline ? 'Online' : contact?.lastSeen ? `Last seen ${new Date(contact.lastSeen).toLocaleTimeString()}` : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <PhoneIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <VideoCameraIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <PaperClipIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <EllipsisHorizontalIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="space-y-2">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="bg-white rounded-lg px-4 py-2 shadow">
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTypingIndicator} />
    </div>
  );
}