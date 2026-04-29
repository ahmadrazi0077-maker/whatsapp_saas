export const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
export const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export const fetchWithCors = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${EDGE_FUNCTIONS_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}
