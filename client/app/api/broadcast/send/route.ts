export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { campaignId, message, contactIds, scheduledFor } = await req.json()
    const token = req.headers.get('authorization')
    
    const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
    const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
    
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/broadcast-handler/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      body: JSON.stringify({ campaignId, message, contactIds, scheduledFor })
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 })
  }
}
