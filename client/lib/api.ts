const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: any) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// WhatsApp APIs
export const whatsappApi = {
  getDevices: () => api.get('/api/whatsapp/devices'),
  connect: () => api.post('/api/whatsapp/connect'),
  disconnect: (deviceId: string) => api.post(`/api/whatsapp/disconnect/${deviceId}`),
  getQR: (deviceId: string) => api.get(`/api/whatsapp/qr/${deviceId}`),
  sendMessage: (deviceId: string, to: string, message: string) =>
    api.post('/api/whatsapp/send', { deviceId, to, message }),
};

// Chat APIs
export const chatApi = {
  getConversations: () => api.get('/api/chats'),
  getMessages: (conversationId: string) => api.get(`/api/messages/${conversationId}`),
  sendMessage: (conversationId: string, message: string) =>
    api.post('/api/messages/send', { conversationId, message }),
  markAsRead: (conversationId: string) =>
    api.put(`/api/messages/read/${conversationId}`),
};

// Contact APIs
export const contactApi = {
  getContacts: () => api.get('/api/contacts'),
  getContact: (id: string) => api.get(`/api/contacts/${id}`),
  createContact: (data: any) => api.post('/api/contacts', data),
  updateContact: (id: string, data: any) => api.put(`/api/contacts/${id}`, data),
  deleteContact: (id: string) => api.delete(`/api/contacts/${id}`),
  importContacts: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_URL}/api/contacts/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${api['token']}` },
      body: formData,
    }).then(res => res.json());
  },
};

// Broadcast APIs
export const broadcastApi = {
  getCampaigns: () => api.get('/api/broadcast/campaigns'),
  createCampaign: (data: any) => api.post('/api/broadcast/create', data),
  cancelCampaign: (campaignId: string) =>
    api.post(`/api/broadcast/cancel/${campaignId}`),
  getStats: (campaignId: string) => api.get(`/api/broadcast/stats/${campaignId}`),
};

// Automation APIs
export const automationApi = {
  getRules: () => api.get('/api/automation/rules'),
  createRule: (data: any) => api.post('/api/automation/rules', data),
  updateRule: (id: string, data: any) => api.put(`/api/automation/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/api/automation/rules/${id}`),
  getAwayMessage: () => api.get('/api/automation/away'),
  updateAwayMessage: (data: any) => api.put('/api/automation/away', data),
  getGreeting: () => api.get('/api/automation/greeting'),
  updateGreeting: (data: any) => api.put('/api/automation/greeting', data),
};