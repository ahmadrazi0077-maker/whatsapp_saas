import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  const response = await fetch(`${EDGE_FUNCTIONS_URL}/messages-handler/conversations`, {
    headers: { 'Authorization': authHeader || '' }
  })
  
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
