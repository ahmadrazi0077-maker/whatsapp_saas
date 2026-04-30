const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

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
  
  const response = await fetch(`${EDGE_FUNCTIONS_URL}/${endpoint}`, {
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
  register: (data: any) => apiCall('auth-handler/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  login: (email: string, password: string) => apiCall('auth-handler/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  getMe: () => apiCall('auth-handler/me'),
}

// ==================== CONTACTS API ====================
export const contactsApi = {
  getAll: () => apiCall('contacts-handler/contacts'),
  
  getById: (id: string) => apiCall(`contacts-handler/${id}`),
  
  create: (data: any) => apiCall('contacts-handler/create', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  update: (id: string, data: any) => apiCall('contacts-handler/update', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data })
  }),
  
  delete: (id: string) => apiCall('contacts-handler/delete', {
    method: 'DELETE',
    body: JSON.stringify({ id })
  }),
  
  import: (contacts: any[]) => apiCall('contacts-handler/import', {
    method: 'POST',
    body: JSON.stringify({ contacts })
  }),
}

// ==================== MESSAGES API ====================
export const messagesApi = {
  getConversations: () => apiCall('messages-handler/conversations'),
  
  getMessages: (conversationId: string) => 
    apiCall(`messages-handler/messages?conversationId=${conversationId}`),
  
  sendMessage: (conversationId: string, message: string, contactId?: string) => 
    apiCall('messages-handler/send', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message, contactId })
    }),
  
  markAsRead: (conversationId: string) => apiCall('messages-handler/read', {
    method: 'PUT',
    body: JSON.stringify({ conversationId })
  }),
}

// ==================== BROADCAST API ====================
export const broadcastApi = {
  getCampaigns: () => apiCall('broadcast-handler/campaigns'),
  
  create: (data: any) => apiCall('broadcast-handler/create', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  updateStatus: (campaignId: string, status: string) => apiCall('broadcast-handler/status', {
    method: 'PUT',
    body: JSON.stringify({ campaignId, status })
  }),
  
  delete: (campaignId: string) => apiCall('broadcast-handler/delete', {
    method: 'DELETE',
    body: JSON.stringify({ campaignId })
  }),
}

// ==================== WHATSAPP DEVICES API ====================
export const devicesApi = {
  getAll: () => apiCall('whatsapp-handler/devices'),
  
  connect: (name?: string) => apiCall('whatsapp-handler/connect', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  
  updateStatus: (deviceId: string, status: string, phoneNumber?: string) => 
    apiCall('whatsapp-handler/status', {
      method: 'PUT',
      body: JSON.stringify({ deviceId, status, phoneNumber })
    }),
  
  disconnect: (deviceId: string) => apiCall('whatsapp-handler/disconnect', {
    method: 'POST',
    body: JSON.stringify({ deviceId })
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
    
    const totalMessages = conversations.reduce((sum: number, conv: any) => sum + (conv.message_count || 0), 0)
    const activeChats = conversations.filter((c: any) => c.status === 'ACTIVE').length
    const connectedDevices = devices.filter((d: any) => d.status === 'connected').length
    
    return {
      stats: {
        totalMessages,
        totalContacts: contacts.length,
        activeChats,
        devices: connectedDevices,
        responseRate: 94,
        avgResponseTime: 45,
        satisfactionRate: 98,
      }
    }
  },
}
