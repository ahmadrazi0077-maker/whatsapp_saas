'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import { io, Socket } from 'socket.io-client';

export default function ChatsPage() {
  const { t } = useTranslation(['whatsapp', 'common']);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    setIsMobileMenuOpen(false);
    
    if (socket) {
      socket.emit('join-conversation', chatId);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Chat List Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-96 w-full border-r`}>
        <ChatList onSelectChat={handleSelectChat} selectedChat={selectedChat} />
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow chatId={selectedChat} socket={socket} />
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('whatsapp:chat.no_chats')}</h3>
              <p className="text-gray-500">{t('whatsapp:chat.start_chat')}</p>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="mt-4 md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Select a chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}