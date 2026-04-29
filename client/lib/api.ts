import { EDGE_FUNCTIONS_URL } from './supabase'

const API_URL = EDGE_FUNCTIONS_URL

export const authApi = {
  register: (data: any) => fetch(`${API_URL}/auth-handler/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  login: (email: string, password: string) => fetch(`${API_URL}/auth-handler/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }),
  
  getMe: (token: string) => fetch(`${API_URL}/auth-handler/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

export const whatsappApi = {
  getDevices: (token: string) => fetch(`${API_URL}/whatsapp-handler/devices`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  connectDevice: (token: string) => fetch(`${API_URL}/whatsapp-handler/connect`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

export const messagesApi = {
  getConversations: (token: string) => fetch(`${API_URL}/messages-handler/conversations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  getMessages: (token: string, conversationId: string) => 
    fetch(`${API_URL}/messages-handler/conversations/${conversationId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
  
  sendMessage: (token: string, conversationId: string, message: string) => 
    fetch(`${API_URL}/messages-handler/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ conversationId, message })
    })
}
