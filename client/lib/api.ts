const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export const authApi = {
  register: async (data: any) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/auth-handler/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  
  login: async (email: string, password: string) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/auth-handler/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },
  
  getMe: async (token: string) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/auth-handler/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }
}
