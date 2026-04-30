export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    console.log('Proxying GET request to Edge Function...')
    
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/contacts`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
        'Origin': req.headers.get('origin') || ''
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('authorization')
    
    console.log('Proxying POST request to Edge Function:', body)
    
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
