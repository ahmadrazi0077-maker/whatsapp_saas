'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Chat {
  id: string;
  contactName: string;
  contactNumber: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  avatar?: string;
}

export default function RecentChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentChats();
  }, []);

  const fetchRecentChats = async () => {
    try {
      const response = await fetch('/api/chats/recent?limit=5');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">No chats yet</p>
        <Link href="/chats" className="text-blue-600 hover:underline mt-2 inline-block">
          Start a conversation
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/chats/${chat.id}`}
          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {chat.contactName?.[0]?.toUpperCase() || chat.contactNumber[0]}
              </div>
            )}
            {chat.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-gray-900 truncate">
                {chat.contactName || chat.contactNumber}
              </h3>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
          </div>
        </Link>
      ))}
      
      <div className="p-4 text-center">
        <Link href="/chats" className="text-blue-600 hover:underline">
          View all chats →
        </Link>
      </div>
    </div>
  );
}