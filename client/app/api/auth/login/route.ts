import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body
    
    console.log('Login request:', { email })
    
    // For now, return mock success
    // This will help you identify if the issue is with the Edge Function
    return NextResponse.json({
      token: 'mock-token-' + Date.now(),
      user: {
        id: '1',
        email: email,
        name: email?.split('@')[0] || 'User',
        role: 'USER',
        workspaceId: 'workspace_1',
        createdAt: new Date().toISOString()
      }
    })
    
    /* REAL IMPLEMENTATION - Uncomment when Edge Function is fixed
    const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
    const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
    
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/auth-handler/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
    */
  } catch (error) {
    console.error('Login proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
