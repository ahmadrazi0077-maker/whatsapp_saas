export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const mockConversations = [
  {
    id: '1',
    last_message: 'Hey, how are you?',
    last_message_at: new Date().toISOString(),
    status: 'ACTIVE',
    unread_count: 2,
    contact: {
      id: '1',
      name: 'Ahmed Raza',
      phone_number: '+923001234567'
    }
  },
  {
    id: '2',
    last_message: 'Thanks for your support!',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'ACTIVE',
    unread_count: 0,
    contact: {
      id: '2',
      name: 'Sarah Khan',
      phone_number: '+923008765432'
    }
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json(mockConversations)
}
