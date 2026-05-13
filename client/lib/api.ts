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
  },
  contacts: {
    getAll: (): Promise<any> => request('/contacts'),
    create: (data: any): Promise<any> => request('/contacts', { method: 'POST', body: data }),
    delete: (id: string): Promise<any> => request(`/contacts/${id}`, { method: 'DELETE' }),
  },
  devices: {
    getAll: (): Promise<any> => request('/devices'),
    connect: (data: any): Promise<any> => request('/devices/connect', { method: 'POST', body: data }),
    disconnect: (id: string): Promise<any> => request(`/devices/${id}/disconnect`, { method: 'POST' }),
  },
  broadcast: {
    getAll: (): Promise<any> => request('/broadcasts'),
    create: (data: any): Promise<any> => request('/broadcasts', { method: 'POST', body: data }),
    send: (id: string): Promise<any> => request(`/broadcasts/${id}/send`, { method: 'POST' }),
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
    deleteRule: (id: string): Promise<any> => request(`/chatbot/rules/${id}`, { method: 'DELETE' }),
  },
  team: { getAll: (): Promise<any> => request('/team') },
  webhooks: { getAll: (): Promise<any> => request('/webhooks') },
  media: { getAll: (): Promise<any> => request('/media') },
  logs: { getAll: (): Promise<any> => request('/logs') },
  analytics: { dashboard: (): Promise<any> => request('/analytics/dashboard') },
  usage: { get: (): Promise<any> => request('/usage') },
  subscription: { get: (): Promise<any> => request('/subscription') },
};
