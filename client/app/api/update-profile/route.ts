import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('authorization')
    
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/auth-handler/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
