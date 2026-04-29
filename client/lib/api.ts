// client/lib/api.ts
const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1/auth-handler`

export const authApi = {
  register: async (data: any) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/register`, {
      method: 'POST',  // ← Must be POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  
  login: async (email: string, password: string) => {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/login`, {
      method: 'POST',  // ← Must be POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  }
}
