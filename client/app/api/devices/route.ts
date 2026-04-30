export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const mockDevices = [
  {
    id: '1',
    name: 'Business Phone',
    phone_number: '+923001234567',
    status: 'connected',
    created_at: new Date().toISOString()
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json(mockDevices)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newDevice = {
      id: Date.now().toString(),
      name: body.name || `Device ${mockDevices.length + 1}`,
      phone_number: `+92300${Math.floor(Math.random() * 9000000) + 1000000}`,
      status: 'connected',
      created_at: new Date().toISOString()
    }
    
    mockDevices.push(newDevice)
    return NextResponse.json(newDevice, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect device' }, { status: 500 })
  }
}
