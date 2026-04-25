import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  return NextResponse.json({ success: true });
}
