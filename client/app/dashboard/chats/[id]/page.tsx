'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  PhoneIcon, 
  VideoCameraIcon, 
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
  PaperClipIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      body: 'Hello! How can I help you?',
      fromMe: false,
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
    },
    {
      id: '2',
      body: 'I need information about your pricing plans',
      fromMe: true,
      timestamp: new Date(Date.now() - 3500000),
      status: 'read',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [contact] = useState({
    name: 'Ahmed Raza',
    phone: '+92 300 1234567',
    isOnline: true,
    lastSeen: new Date(),
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      body: newMessage,
      fromMe: true,
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        body: 'Thanks for your message! I\'ll get back to you shortly.',
        fromMe: false,
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500);
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😀', '😂', '😊', '❤️', '👍', '🎉', '🔥', '✨'];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {contact.name[0]}
            </div>
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contact.isOnline ? 'Online' : 'Offline'}
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
          <div
            key={message.id}
            className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.fromMe
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
              }`}
            >
              <p className="text-sm break-words">{message.body}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs ${message.fromMe ? 'text-blue-200' : 'text-gray-400'}`}>
                <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                {message.fromMe && message.status === 'read' && <span>✓✓</span>}
                {message.fromMe && message.status === 'delivered' && <span>✓✓</span>}
                {message.fromMe && message.status === 'sent' && <span>✓</span>}
              </div>
            </div>
          </div>
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
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <PaperClipIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          
          <div className="relative flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition"
              >
                <FaceSmileIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
