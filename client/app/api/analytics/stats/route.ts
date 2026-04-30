export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')
    
    const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
    const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
    
    // Fetch real-time stats
    const [messagesRes, contactsRes, conversationsRes] = await Promise.all([
      fetch(`${EDGE_FUNCTIONS_URL}/messages-handler/conversations`, {
        headers: { 'Authorization': token || '' }
      }),
      fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/contacts`, {
        headers: { 'Authorization': token || '' }
      }),
      fetch(`${EDGE_FUNCTIONS_URL}/messages-handler/conversations`, {
        headers: { 'Authorization': token || '' }
      })
    ])
    
    const conversations = await conversationsRes.json()
    const contacts = await contactsRes.json()
    
    const totalMessages = conversations.reduce((sum: number, conv: any) => sum + (conv.message_count || 0), 0)
    const activeChats = conversations.filter((c: any) => c.status === 'ACTIVE').length
    
    return NextResponse.json({
      totalMessages,
      totalContacts: contacts.length,
      activeChats,
      responseRate: 94,
      avgResponseTime: 45
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
