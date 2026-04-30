// Use local Next.js API routes as proxy (no CORS issues)
const API_BASE_URL = '/api'

// Helper to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Helper for API calls
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

// ==================== AUTH API ====================
export const authApi = {
  register: (data: any) => apiCall('auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  login: (email: string, password: string) => apiCall('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  getMe: () => apiCall('auth/me'),
}

// ==================== CONTACTS API ====================
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

// ==================== MESSAGES API ====================
export const messagesApi = {
  getConversations: () => apiCall('messages/conversations'),
  
  getMessages: (conversationId: string) => 
    apiCall(`messages?conversationId=${conversationId}`),
  
  sendMessage: (conversationId: string, message: string) => 
    apiCall('messages/send', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message })
    }),
  
  markAsRead: (conversationId: string) => apiCall('messages/read', {
    method: 'PUT',
    body: JSON.stringify({ conversationId })
  }),
}

// ==================== BROADCAST API ====================
export const broadcastApi = {
  getCampaigns: () => apiCall('broadcast/campaigns'),
  
  create: (data: any) => apiCall('broadcast', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
}

// ==================== DEVICES API ====================
export const devicesApi = {
  getAll: () => apiCall('devices'),
  
  connect: () => apiCall('devices/connect', {
    method: 'POST'
  }),
  
  disconnect: (deviceId: string) => apiCall(`devices/${deviceId}/disconnect`, {
    method: 'POST'
  }),
}

// ==================== ANALYTICS API ====================
export const analyticsApi = {
  getDashboardStats: async () => {
    const [contacts, conversations, devices] = await Promise.all([
      contactsApi.getAll().catch(() => []),
      messagesApi.getConversations().catch(() => []),
      devicesApi.getAll().catch(() => [])
    ])
    
    return {
      stats: {
        totalMessages: conversations.reduce((sum: number, conv: any) => sum + (conv.message_count || 0), 0),
        totalContacts: contacts.length,
        activeChats: conversations.filter((c: any) => c.status === 'ACTIVE').length,
        devices: devices.filter((d: any) => d.status === 'CONNECTED').length,
        responseRate: 94,
        avgResponseTime: 45,
        satisfactionRate: 98,
      }
    }
  },
}
