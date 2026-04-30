const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
const API_BASE_URL = '/api'

// Helper to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Helper for API calls to Edge Functions
async function edgeFunctionCall(endpoint: string, options: RequestInit = {}) {
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

// ==================== WHATSAPP DEVICES API ====================
export const devicesApi = {
  getAll: () => edgeFunctionCall('whatsapp-handler/devices'),
  
  connect: (name?: string) => edgeFunctionCall('whatsapp-handler/connect', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  
  disconnect: (deviceId: string) => edgeFunctionCall('whatsapp-handler/disconnect', {
    method: 'POST',
    body: JSON.stringify({ deviceId })
  }),
  
  getQR: (deviceId: string) => edgeFunctionCall(`whatsapp-handler/qr?deviceId=${deviceId}`),
  
  updateStatus: (deviceId: string, status: string, phoneNumber?: string) => 
    edgeFunctionCall('whatsapp-handler/status', {
      method: 'PUT',
      body: JSON.stringify({ deviceId, status, phoneNumber })
    }),
}

// ==================== CONTACTS API ====================
export const contactsApi = {
  getAll: () => edgeFunctionCall('contacts-handler/contacts'),
  
  getById: (id: string) => edgeFunctionCall(`contacts-handler/${id}`),
  
  create: (data: any) => edgeFunctionCall('contacts-handler/create', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  update: (id: string, data: any) => edgeFunctionCall('contacts-handler/update', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data })
  }),
  
  delete: (id: string) => edgeFunctionCall('contacts-handler/delete', {
    method: 'DELETE',
    body: JSON.stringify({ id })
  }),
  
  import: (contacts: any[]) => edgeFunctionCall('contacts-handler/import', {
    method: 'POST',
    body: JSON.stringify({ contacts })
  }),
  
  search: (query: string) => edgeFunctionCall(`contacts-handler/search?q=${query}`),
}

// ==================== MESSAGES & CHATS API ====================
export const messagesApi = {
  getConversations: () => edgeFunctionCall('messages-handler/conversations'),
  
  getMessages: (conversationId: string) => 
    edgeFunctionCall(`messages-handler/messages?conversationId=${conversationId}`),
  
  sendMessage: (conversationId: string, message: string, contactId?: string) => 
    edgeFunctionCall('messages-handler/send', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message, contactId })
    }),
  
  markAsRead: (conversationId: string) => edgeFunctionCall('messages-handler/read', {
    method: 'PUT',
    body: JSON.stringify({ conversationId })
  }),
  
  deleteMessage: (messageId: string) => edgeFunctionCall('messages-handler/delete', {
    method: 'DELETE',
    body: JSON.stringify({ messageId })
  }),
}

// ==================== BROADCAST API ====================
export const broadcastApi = {
  getCampaigns: () => edgeFunctionCall('broadcast-handler/campaigns'),
  
  getCampaign: (campaignId: string) => edgeFunctionCall(`broadcast-handler/campaigns/${campaignId}`),
  
  create: (data: any) => edgeFunctionCall('broadcast-handler/create', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  updateStatus: (campaignId: string, status: string) => edgeFunctionCall('broadcast-handler/status', {
    method: 'PUT',
    body: JSON.stringify({ campaignId, status })
  }),
  
  delete: (campaignId: string) => edgeFunctionCall('broadcast-handler/delete', {
    method: 'DELETE',
    body: JSON.stringify({ campaignId })
  }),
  
  sendNow: (campaignId: string) => edgeFunctionCall('broadcast-handler/send', {
    method: 'POST',
    body: JSON.stringify({ campaignId })
  }),
  
  schedule: (campaignId: string, scheduledFor: string) => edgeFunctionCall('broadcast-handler/schedule', {
    method: 'POST',
    body: JSON.stringify({ campaignId, scheduledFor })
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
  
  getMessageTrends: (days: number = 7) => edgeFunctionCall(`analytics-handler/messages?days=${days}`),
  
  getTopContacts: (limit: number = 10) => edgeFunctionCall(`analytics-handler/top-contacts?limit=${limit}`),
  
  getActivityByHour: () => edgeFunctionCall('analytics-handler/activity-by-hour'),
  
  getMessageTypes: () => edgeFunctionCall('analytics-handler/message-types'),
}

// ==================== SETTINGS API ====================
export const settingsApi = {
  getWorkspaceSettings: () => edgeFunctionCall('settings-handler/workspace'),
  
  updateWorkspaceSettings: (data: any) => edgeFunctionCall('settings-handler/workspace', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  getTeamMembers: () => edgeFunctionCall('settings-handler/team'),
  
  inviteTeamMember: (email: string, role: string) => edgeFunctionCall('settings-handler/team/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role })
  }),
  
  removeTeamMember: (memberId: string) => edgeFunctionCall('settings-handler/team/remove', {
    method: 'DELETE',
    body: JSON.stringify({ memberId })
  }),
  
  updateTeamMemberRole: (memberId: string, role: string) => edgeFunctionCall('settings-handler/team/role', {
    method: 'PUT',
    body: JSON.stringify({ memberId, role })
  }),
}

// ==================== PAYMENTS API ====================
export const paymentsApi = {
  getPlans: () => edgeFunctionCall('payments-handler/plans'),
  
  createSubscription: (planId: string, paymentMethod: string) => apiCall('payments/create-subscription', {
    method: 'POST',
    body: JSON.stringify({ planId, paymentMethod })
  }),
  
  cancelSubscription: (subscriptionId: string) => apiCall('payments/cancel-subscription', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId })
  }),
  
  getInvoices: () => apiCall('payments/invoices'),
  
  createPaymentIntent: (amount: number, currency: string, paymentMethod: string) => 
    apiCall('payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, paymentMethod })
    }),
}

// ==================== WEBHOOKS API ====================
export const webhooksApi = {
  getWebhooks: () => edgeFunctionCall('webhooks-handler'),
  
  createWebhook: (url: string, events: string[]) => edgeFunctionCall('webhooks-handler', {
    method: 'POST',
    body: JSON.stringify({ url, events })
  }),
  
  updateWebhook: (webhookId: string, data: any) => edgeFunctionCall(`webhooks-handler/${webhookId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  deleteWebhook: (webhookId: string) => edgeFunctionCall(`webhooks-handler/${webhookId}`, {
    method: 'DELETE'
  }),
}

// ==================== EXPORTS ====================
export default {
  auth: authApi,
  devices: devicesApi,
  contacts: contactsApi,
  messages: messagesApi,
  broadcast: broadcastApi,
  analytics: analyticsApi,
  settings: settingsApi,
  payments: paymentsApi,
  webhooks: webhooksApi,
}
