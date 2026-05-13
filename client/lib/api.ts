const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request(endpoint: string, options: any = {}): Promise<any> {
  const { method = 'GET', body } = options;
  const headers: any = { 'Content-Type': 'application/json' };
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const config: any = { method, headers };
  if (body) config.body = JSON.stringify(body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result.data;
}

export const api: any = {
  auth: {
    login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (data: any) => request('/auth/register', { method: 'POST', body: data }),
    me: () => request('/auth/me'),
    updateProfile: (data: any) => request('/auth/me', { method: 'PUT', body: data }),
    changePassword: (data: any) => request('/auth/change-password', { method: 'POST', body: data }),
  },
  chats: {
    getAll: () => request('/chats'),
    getById: (id: string) => request(`/chats/${id}`),
    sendMessage: (chatId: string, message: string) => request(`/chats/${chatId}/messages`, { method: 'POST', body: { message } }),
    create: (data: any) => request('/chats', { method: 'POST', body: data }),
  },
  contacts: {
    getAll: () => request('/contacts'),
    create: (data: any) => request('/contacts', { method: 'POST', body: data }),
    update: (id: string, data: any) => request(`/contacts/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request(`/contacts/${id}`, { method: 'DELETE' }),
  },
  devices: {
    getAll: () => request('/devices'),
    getById: (id: string) => request(`/devices/${id}`),
    connect: (data: any) => request('/devices/connect', { method: 'POST', body: data }),
    disconnect: (id: string) => request(`/devices/${id}/disconnect`, { method: 'POST' }),
    getQR: (id: string) => request(`/devices/${id}/qr`),
  },
  broadcast: {
    getAll: () => request('/broadcasts'),
    create: (data: any) => request('/broadcasts', { method: 'POST', body: data }),
    send: (id: string) => request(`/broadcasts/${id}/send`, { method: 'POST' }),
    delete: (id: string) => request(`/broadcasts/${id}`, { method: 'DELETE' }),
    schedule: (id: string, scheduledAt: string) => request(`/broadcasts/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  },
  campaigns: {
    getAll: () => request('/campaigns'),
    create: (data: any) => request('/campaigns', { method: 'POST', body: data }),
    send: (id: string) => request(`/campaigns/${id}/send`, { method: 'POST' }),
    delete: (id: string) => request(`/campaigns/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) => request(`/campaigns/${id}/duplicate`, { method: 'POST' }),
    update: (id: string, data: any) => request(`/campaigns/${id}`, { method: 'PUT', body: data }),
  },
  templates: {
    getAll: () => request('/templates'),
    create: (data: any) => request('/templates', { method: 'POST', body: data }),
    update: (id: string, data: any) => request(`/templates/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request(`/templates/${id}`, { method: 'DELETE' }),
  },
  chatbot: {
    getRules: () => request('/chatbot/rules'),
    createRule: (data: any) => request('/chatbot/rules', { method: 'POST', body: data }),
    updateRule: (id: string, data: any) => request(`/chatbot/rules/${id}`, { method: 'PUT', body: data }),
    deleteRule: (id: string) => request(`/chatbot/rules/${id}`, { method: 'DELETE' }),
  },
  team: {
    getAll: () => request('/team'),
    invite: (email: string, role: string) => request('/team', { method: 'POST', body: { email, role } }),
    remove: (id: string) => request(`/team/${id}`, { method: 'DELETE' }),
  },
  webhooks: {
    getAll: () => request('/webhooks'),
    create: (data: any) => request('/webhooks', { method: 'POST', body: data }),
    delete: (id: string) => request(`/webhooks/${id}`, { method: 'DELETE' }),
  },
  media: {
    getAll: () => request('/media'),
    upload: (data: any) => request('/media/upload', { method: 'POST', body: data }),
    delete: (id: string) => request(`/media/${id}`, { method: 'DELETE' }),
  },
  logs: { getAll: () => request('/logs') },
  analytics: { dashboard: () => request('/analytics/dashboard') },
  usage: { get: () => request('/usage') },
  subscription: {
    get: () => request('/subscription'),
    cancel: () => request('/subscription/cancel', { method: 'POST' }),
    createCheckout: (planId: string, billingCycle: string) => request('/stripe/create-checkout', { method: 'POST', body: { planId, billingCycle } }),
  },
};
