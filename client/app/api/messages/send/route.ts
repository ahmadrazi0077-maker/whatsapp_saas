export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { conversationId, message } = await req.json()
    
    const newMessage = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      body: message,
      from_me: true,
      status: 'sent',
      created_at: new Date().toISOString()
    }
    
    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
