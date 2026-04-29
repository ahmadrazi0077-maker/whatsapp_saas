const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1/auth-handler`

export const authApi = {
  register: async (data: any) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/register`, {  // ← Note: /register not /auth-handler/register
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  
  login: async (email: string, password: string) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/login`, {  // ← Note: /login
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },
  
  getMe: async (token: string) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/me`, {  // ← Note: /me
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  },
  
  test: async () => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/test`)
    return response.json()
  },
  
  health: async () => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/health`)
    return response.json()
  }
}
