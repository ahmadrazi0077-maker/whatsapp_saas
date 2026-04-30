import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  const response = await fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/contacts`, {
    headers: { 'Authorization': authHeader || '' }
  })
  
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const authHeader = req.headers.get('authorization')
  
  const response = await fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader || ''
    },
    body: JSON.stringify(body)
  })
  
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
