import { create } from 'zustand';

interface Message {
  id: string;
  conversationId: string;
  body: string;
  fromMe: boolean;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatState {
  conversations: any[];
  currentConversation: string | null;
  messages: Record<string, Message[]>;
  unreadCount: number;
  setConversations: (conversations: any[]) => void;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  incrementUnread: (conversationId: string) => void;
  resetUnread: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: {},
  unreadCount: 0,
  
  setConversations: (conversations) => set({ conversations }),
  
  setCurrentConversation: (id) => set({ currentConversation: id }),
  
  addMessage: (conversationId, message) => {
    const currentMessages = get().messages[conversationId] || [];
    set({
      messages: {
        ...get().messages,
        [conversationId]: [...currentMessages, message],
      },
    });
  },
  
  updateMessageStatus: (messageId, status) => {
    const messages = { ...get().messages };
    for (const convId in messages) {
      const messageIndex = messages[convId].findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages[convId][messageIndex].status = status;
        break;
      }
    }
    set({ messages });
  },
  
  incrementUnread: (conversationId) => {
    const conversations = get().conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
        : conv
    );
    set({
      conversations,
      unreadCount: get().unreadCount + 1,
    });
  },
  
  resetUnread: (conversationId) => {
    const conversations = get().conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );
    set({ conversations });
  },
}));