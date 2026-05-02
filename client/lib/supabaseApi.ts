const API_BASE_URL = '/api'

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  register: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export const contactsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/contacts`);
    return response.json();
  }
};

export const devicesApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/devices`);
    return response.json();
  }
};

export const messagesApi = {
  getConversations: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations`);
    return response.json();
  }
};

export const broadcastApi = {
  getCampaigns: async () => {
    const response = await fetch(`${API_BASE_URL}/broadcast/campaigns`);
    return response.json();
  }
};

export const analyticsApi = {
  getDashboardStats: async () => {
    const contacts = await contactsApi.getAll().catch(() => []);
    return {
      stats: {
        totalMessages: 0,
        totalContacts: contacts.length,
        activeChats: 0,
        devices: 0,
        responseRate: 94,
        avgResponseTime: 45,
        satisfactionRate: 98,
      }
    };
  }
};
