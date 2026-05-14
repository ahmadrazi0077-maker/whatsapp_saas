const API_BASE_URL = '/api';

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
    login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (data: any) => request('/auth/register', { method: 'POST', body: data }),
    me: () => request('/auth/me'),
    updateProfile: (data: any) => request('/auth/me', { method: 'PUT', body: data }),
    changePassword: (data: any) => request('/auth/change-password', { method: 'POST', body: data }),
    settings: (data: any) => request('/auth/settings', { method: 'PUT', body: data }),
    regenerateApiKey: () => request('/auth/api-key/regenerate', { method: 'POST' }),
    deleteAccount: () => request('/auth/account', { method: 'DELETE' }),
  },
  usage: {
    get: () => request('/usage'),
    check: (action: string) => request(`/usage/check/${action}`),
  },
  subscription: {
    get: () => request('/subscription'),
    cancel: () => request('/subscription/cancel', { method: 'POST' }),
    createCheckout: (planId: string, billingCycle: string) => request('/stripe/create-checkout', { method: 'POST', body: { planId, billingCycle } }),
  },
  chats: {
    getAll: () => request('/chats'),
    sendMessage: (chatId: string, message: string) => request(`/chats/${chatId}/messages`, { method: 'POST', body: { message } }),
  },
  contacts: {
  getAll: () => request<any[]>('/contacts'),
  create: (data: any) => request<any>('/contacts', { method: 'POST', body: data }),
  update: (id: string, data: any) => request<any>(`/contacts/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => request<any>(`/contacts/${id}`, { method: 'DELETE' }),
},
broadcast: {
  getAll: () => request<any[]>('/broadcasts'),
  create: (data: any) => request<any>('/broadcasts', { method: 'POST', body: data }),
  send: (id: string) => request<any>(`/broadcasts/${id}/send`, { method: 'POST' }),
  delete: (id: string) => request<any>(`/broadcasts/${id}`, { method: 'DELETE' }),
},
  devices: {
    getAll: () => request('/devices'),
    connect: (data: any) => request('/devices/connect', { method: 'POST', body: data }),
    disconnect: (id: string) => request(`/devices/${id}/disconnect`, { method: 'POST' }),
  },
 
  analytics: {
    dashboard: () => request('/analytics/dashboard'),
  },
    templates: {
    getAll: () => request<any[]>('/templates'),
    create: (data: any) => request<any>('/templates', { method: 'POST', body: data }),
    update: (id: string, data: any) => request<any>(`/templates/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request<any>(`/templates/${id}`, { method: 'DELETE' }),
  },
  chatbot: {
    getRules: () => request<any[]>('/chatbot/rules'),
    createRule: (data: any) => request<any>('/chatbot/rules', { method: 'POST', body: data }),
    updateRule: (id: string, data: any) => request<any>(`/chatbot/rules/${id}`, { method: 'PUT', body: data }),
    deleteRule: (id: string) => request<any>(`/chatbot/rules/${id}`, { method: 'DELETE' }),
  },
  team: {
    getAll: () => request<any[]>('/team'),
    invite: (email: string, role: string) => request<any>('/team', { method: 'POST', body: { email, role } }),
    remove: (id: string) => request<any>(`/team/${id}`, { method: 'DELETE' }),
  },
  webhooks: {
    getAll: () => request<any[]>('/webhooks'),
    create: (data: any) => request<any>('/webhooks', { method: 'POST', body: data }),
    delete: (id: string) => request<any>(`/webhooks/${id}`, { method: 'DELETE' }),
  },
  logs: {
    getAll: () => request<any[]>('/logs'),
  },
};
