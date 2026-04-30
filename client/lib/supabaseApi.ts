export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

async function callEdgeFunction(endpoint: string, options: { method?: string; body?: any; authHeader?: string }) {
  const response = await fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.authHeader && { 'Authorization': options.authHeader }),
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  })
  
  const data = await response.json()
  return { data, status: response.status }
}

// GET /api/contacts - Get all contacts
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const { data, status } = await callEdgeFunction('contacts', { authHeader })
    return NextResponse.json(data, { status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

// POST /api/contacts - Create a contact
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('authorization') || ''
    const { data, status } = await callEdgeFunction('create', { 
      method: 'POST', 
      body, 
      authHeader 
    })
    return NextResponse.json(data, { status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
