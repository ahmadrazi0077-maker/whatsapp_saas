export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, you would:
    // 1. Find the device in the database
    // 2. Update its status to 'disconnected'
    // 3. Close any WebSocket connections
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to disconnect device' },
      { status: 500 }
    )
  }
}
