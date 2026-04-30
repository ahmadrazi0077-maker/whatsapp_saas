const API_BASE_URL = '/api'

// Helper to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Helper for API calls to Next.js API routes
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
  
  updateProfile: (data: any) => apiCall('auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  changePassword: (oldPassword: string, newPassword: string) => apiCall('auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  }),
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
  import: (contacts: any[]) => apiCall('contacts/import', {
    method: 'POST',
    body: JSON.stringify({ contacts })
  }),
}

// ==================== DEVICES API ====================
export const devicesApi = {
  getAll: () => apiCall('devices'),
  getById: (id: string) => apiCall(`devices/${id}`),
  connect: (name?: string) => apiCall('devices/connect', {
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

// ==================== MESSAGES API ====================
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

// ==================== BROADCAST API ====================
export const broadcastApi = {
  getCampaigns: () => apiCall('broadcast/campaigns'),
  getCampaign: (campaignId: string) => apiCall(`broadcast/campaigns/${campaignId}`),
  create: (data: any) => apiCall('broadcast', {
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

// ==================== ANALYTICS API ====================
export const analyticsApi = {
  getDashboardStats: async () => {
    try {
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

// ==================== SETTINGS API ====================
export const settingsApi = {
  getProfile: () => apiCall('settings/profile'),
  updateProfile: (data: any) => apiCall('settings/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getTeamMembers: () => apiCall('settings/team'),
  inviteTeamMember: (email: string, role: string) => apiCall('settings/team/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role })
  }),
  removeTeamMember: (memberId: string) => apiCall(`settings/team/${memberId}`, {
    method: 'DELETE'
  }),
  getBillingInfo: () => apiCall('settings/billing'),
  updateBillingInfo: (data: any) => apiCall('settings/billing', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
}

// ==================== NOTIFICATIONS API ====================
export const notificationsApi = {
  getSettings: () => apiCall('notifications'),
  updateSettings: (data: any) => apiCall('notifications', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
}

// Export all as default
export default {
  auth: authApi,
  contacts: contactsApi,
  devices: devicesApi,
  messages: messagesApi,
  broadcast: broadcastApi,
  analytics: analyticsApi,
  settings: settingsApi,
  notifications: notificationsApi,
}
