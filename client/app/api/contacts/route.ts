import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: '1', name: 'John Doe', phone_number: '+923001234567', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', phone_number: '+923008765432', email: 'jane@example.com' }
  ]);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newContact = {
    id: Date.now().toString(),
    ...body,
    created_at: new Date().toISOString()
  };
  return NextResponse.json(newContact, { status: 201 });
}
