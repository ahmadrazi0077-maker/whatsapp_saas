import { NextResponse } from 'next/server';

export async function GET() {
  // Return empty devices array for now
  return NextResponse.json([]);
}
