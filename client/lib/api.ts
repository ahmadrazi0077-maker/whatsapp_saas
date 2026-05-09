const API_BASE_URL = 'http://localhost:3001/api';

async function request<T>(endpoint: string, options: any = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const headers: any = { 'Content-Type': 'application/json' };
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    // Handle limit reached
    if (result.code === 'LIMIT_REACHED') {
      if (typeof window !== 'undefined' && confirm(`${result.error}\n\nWould you like to upgrade your plan?`)) {
        window.location.href = result.upgradeUrl || '/dashboard/upgrade';
      }
    }
    throw new Error(result.error || 'Request failed');
  }

  return result.data;
}

export const api = {
  auth: {
    login: (email: string, password: string): Promise<any> => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (data: any): Promise<any> => request('/auth/register', { method: 'POST', body: data }),
    me: (): Promise<any> => request('/auth/me'),
    updateProfile: (data: any): Promise<any> => request('/auth/me', { method: 'PUT', body: data }),
    changePassword: (data: any): Promise<any> => request('/auth/change-password', { method: 'POST', body: data }),
  },
  chats: {
    getAll: (): Promise<any> => request('/chats'),
    getById: (id: string): Promise<any> => request(`/chats/${id}`),
    sendMessage: (chatId: string, message: string): Promise<any> => request(`/chats/${chatId}/messages`, { method: 'POST', body: { message } }),
    create: (data: any): Promise<any> => request('/chats', { method: 'POST', body: data }),
  },
  contacts: {
    getAll: (): Promise<any> => request('/contacts'),
    create: (data: any): Promise<any> => request('/contacts', { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<any> => request(`/contacts/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<any> => request(`/contacts/${id}`, { method: 'DELETE' }),
  },
  devices: {
    getAll: (): Promise<any> => request('/devices'),
    getById: (id: string): Promise<any> => request(`/devices/${id}`),
    connect: (data: any): Promise<any> => request('/devices/connect', { method: 'POST', body: data }),
    disconnect: (id: string): Promise<any> => request(`/devices/${id}/disconnect`, { method: 'POST' }),
  },
  broadcast: {
    getAll: (): Promise<any> => request('/broadcasts'),
    create: (data: any): Promise<any> => request('/broadcasts', { method: 'POST', body: data }),
    send: (id: string): Promise<any> => request(`/broadcasts/${id}/send`, { method: 'POST' }),
    delete: (id: string): Promise<any> => request(`/broadcasts/${id}`, { method: 'DELETE' }),
  },
  campaigns: {
    getAll: (): Promise<any> => request('/campaigns'),
    create: (data: any): Promise<any> => request('/campaigns', { method: 'POST', body: data }),
    send: (id: string): Promise<any> => request(`/campaigns/${id}/send`, { method: 'POST' }),
    delete: (id: string): Promise<any> => request(`/campaigns/${id}`, { method: 'DELETE' }),
  },
  templates: {
    getAll: (): Promise<any> => request('/templates'),
    create: (data: any): Promise<any> => request('/templates', { method: 'POST', body: data }),
    delete: (id: string): Promise<any> => request(`/templates/${id}`, { method: 'DELETE' }),
  },
  chatbot: {
    getRules: (): Promise<any> => request('/chatbot/rules'),
    createRule: (data: any): Promise<any> => request('/chatbot/rules', { method: 'POST', body: data }),
    updateRule: (id: string, data: any): Promise<any> => request(`/chatbot/rules/${id}`, { method: 'PUT', body: data }),
    deleteRule: (id: string): Promise<any> => request(`/chatbot/rules/${id}`, { method: 'DELETE' }),
  },
  team: {
    getAll: (): Promise<any> => request('/team'),
    invite: (email: string, role: string): Promise<any> => request('/team', { method: 'POST', body: { email, role } }),
    remove: (id: string): Promise<any> => request(`/team/${id}`, { method: 'DELETE' }),
  },
  webhooks: {
    getAll: (): Promise<any> => request('/webhooks'),
    create: (data: any): Promise<any> => request('/webhooks', { method: 'POST', body: data }),
    delete: (id: string): Promise<any> => request(`/webhooks/${id}`, { method: 'DELETE' }),
  },
  media: {
    getAll: (): Promise<any> => request('/media'),
    upload: (data: any): Promise<any> => request('/media/upload', { method: 'POST', body: data }),
    delete: (id: string): Promise<any> => request(`/media/${id}`, { method: 'DELETE' }),
  },
  logs: {
    getAll: (): Promise<any> => request('/logs'),
  },
  analytics: {
    dashboard: (): Promise<any> => request('/analytics/dashboard'),
  },
  usage: {
    get: (): Promise<any> => request('/usage'),
  },
  subscription: {
    get: (): Promise<any> => request('/subscription'),
    cancel: (): Promise<any> => request('/subscription/cancel', { method: 'POST' }),
    createCheckout: (planId: string, billingCycle: string): Promise<any> => request('/stripe/create-checkout', { method: 'POST', body: { planId, billingCycle } }),
  },

