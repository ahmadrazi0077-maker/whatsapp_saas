const API_BASE_URL = '/api'

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `API call failed: ${response.status}`)
  }
  
  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) => apiCall('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (data: any) => apiCall('auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMe: () => apiCall('auth/me'),
}

// Contacts API
export const contactsApi = {
  getAll: () => apiCall('contacts'),
  getById: (id: string) => apiCall(`contacts/${id}`),
  create: (data: any) => apiCall('contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: any) => apiCall(`contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => apiCall(`contacts/${id}`, {
    method: 'DELETE'
  }),
}

// Devices API
export const devicesApi = {
  getAll: () => apiCall('devices'),
  getById: (id: string) => apiCall(`devices/${id}`),
  connect: (name?: string) => apiCall('devices', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  disconnect: (deviceId: string) => apiCall(`devices/${deviceId}/disconnect`, {
    method: 'POST'
  }),
  updateStatus: (deviceId: string, status: string) => apiCall(`devices/${deviceId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
}

// Messages API
export const messagesApi = {
  getConversations: () => apiCall('messages/conversations'),
  getMessages: (conversationId: string) => apiCall(`messages?conversationId=${conversationId}`),
  sendMessage: (conversationId: string, message: string) => apiCall('messages/send', {
    method: 'POST',
    body: JSON.stringify({ conversationId, message })
  }),
  markAsRead: (conversationId: string) => apiCall('messages/read', {
    method: 'PUT',
    body: JSON.stringify({ conversationId })
  }),
}

// Broadcast API
export const broadcastApi = {
  getCampaigns: () => apiCall('broadcast/campaigns'),
  getCampaign: (campaignId: string) => apiCall(`broadcast/campaigns/${campaignId}`),
  create: (data: any) => apiCall('broadcast/campaigns', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStatus: (campaignId: string, status: string) => apiCall(`broadcast/campaigns/${campaignId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  delete: (campaignId: string) => apiCall(`broadcast/campaigns/${campaignId}`, {
    method: 'DELETE'
  }),
}

// Analytics API
export const analyticsApi = {
  getDashboardStats: async () => {
    try {
      const contacts = await contactsApi.getAll().catch(() => [])
      const devices = await devicesApi.getAll().catch(() => [])
      const conversations = await messagesApi.getConversations().catch(() => [])
      
      return {
        stats: {
          totalMessages: 0,
          totalContacts: contacts.length,
          activeChats: conversations.length,
          devices: devices.filter((d: any) => d.status === 'connected').length,
          responseRate: 94,
          avgResponseTime: 45,
          satisfactionRate: 98,
        }
      }
    } catch {
      return {
        stats: {
          totalMessages: 0,
          totalContacts: 0,
          activeChats: 0,
          devices: 0,
          responseRate: 0,
          avgResponseTime: 0,
          satisfactionRate: 0,
        }
      }
    }
  },
}

export default {
  auth: authApi,
  contacts: contactsApi,
  devices: devicesApi,
  messages: messagesApi,
  broadcast: broadcastApi,
  analytics: analyticsApi,
}
