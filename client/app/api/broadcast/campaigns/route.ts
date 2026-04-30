export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const mockCampaigns = [
  {
    id: '1',
    name: 'Summer Sale',
    message: 'Get 50% off on all products!',
    status: 'COMPLETED',
    sent_count: 150,
    total_recipients: 150,
    created_at: new Date().toISOString()
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json(mockCampaigns)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newCampaign = {
      id: Date.now().toString(),
      name: body.name || `Campaign ${mockCampaigns.length + 1}`,
      message: body.message,
      status: 'DRAFT',
      sent_count: 0,
      total_recipients: 0,
      created_at: new Date().toISOString()
    }
    
    mockCampaigns.unshift(newCampaign)
    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
