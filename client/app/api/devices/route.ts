import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: '1', name: 'Business Phone', phone_number: '+923001234567', status: 'connected' }
  ]);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newDevice = {
    id: Date.now().toString(),
    name: body.name || 'New Device',
    phone_number: '+92300' + Math.floor(Math.random() * 9000000 + 1000000),
    status: 'connected',
    created_at: new Date().toISOString()
  };
  return NextResponse.json(newDevice, { status: 201 });
}
