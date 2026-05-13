'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Send } from 'lucide-react';
import { api } from '@/lib/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export default function ChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data: any = await api.chats.getAll();
      setChats(data || []);
    } catch (err) {
      console.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadMessages = async (chatId: string) => {
    try {
      const chatData = await api.chats.getById(chatId);
      setMessages(chatData.messages || []);
    } catch (error) {
      console.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;
    try {
      await api.chats.sendMessage(selectedChat.id, messageInput);
      setMessageInput('');
      loadMessages(selectedChat.id);
      loadChats();
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat: any) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 ${
                selectedChat?.id === chat.id ? 'bg-whatsapp-green/10' : ''
              }`}
            >
              <div className="font-medium">{chat.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{chat.lastMessage || 'No messages'}</div>
            </div>
          ))}
          {chats.length === 0 && (
            <p className="p-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">No chats yet</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">{selectedChat.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{selectedChat.phoneNumber}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`mb-2 ${msg.sender === 'me' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    msg.sender === 'me' ? 'bg-whatsapp-green-light' : 'bg-white dark:bg-gray-800'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full"
                />
                <button type="submit" className="p-2 bg-whatsapp-green text-white rounded-full">
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
