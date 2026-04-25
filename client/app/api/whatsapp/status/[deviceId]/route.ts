import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  return NextResponse.json({ status: 'disconnected' });
}
