'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface Chat {
  id: string;
  contactName: string;
  contactNumber: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  avatar?: string;
  isOnline?: boolean;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      contactName: 'Ahmed Raza',
      contactNumber: '+92 300 1234567',
      lastMessage: 'Thanks for your support!',
      lastMessageTime: new Date(),
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: '2',
      contactName: 'Sarah Khan',
      contactNumber: '+92 321 7654321',
      lastMessage: 'When will the order arrive?',
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '3',
      contactName: 'Tech Solutions',
      contactNumber: '+92 300 9876543',
      lastMessage: 'Please share the pricing details',
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 1,
      isOnline: true,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredChats = chats.filter(chat =>
    chat.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.contactNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your conversations</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Chats List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No chats found</h3>
            <p className="text-gray-500 dark:text-gray-400">Start a conversation by connecting a device</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/dashboard/chats/${chat.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="relative">
                    {chat.avatar ? (
                      <Image
                        src={chat.avatar}
                        alt={chat.contactName}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {chat.contactName?.[0]?.toUpperCase() || chat.contactNumber[0]}
                      </div>
                    )}
                    {chat.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {chat.contactName || chat.contactNumber}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
