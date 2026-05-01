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

// Export all APIs
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

export const contactsApi = {
  getAll: () => apiCall('contacts'),
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

export const devicesApi = {
  getAll: () => apiCall('devices'),
  connect: (name?: string) => apiCall('devices', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
}

export const messagesApi = {
  getConversations: () => apiCall('messages/conversations'),
  sendMessage: (conversationId: string, message: string) => apiCall('messages/send', {
    method: 'POST',
    body: JSON.stringify({ conversationId, message })
  }),
}

export const broadcastApi = {
  getCampaigns: () => apiCall('broadcast/campaigns'),
  create: (data: any) => apiCall('broadcast/campaigns', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
}

export const analyticsApi = {
  getDashboardStats: async () => {
    const contacts = await contactsApi.getAll().catch(() => [])
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
    }
  },
}
