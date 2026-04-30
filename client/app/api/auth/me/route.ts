export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Return mock user data for testing
  return NextResponse.json({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    workspaceId: 'workspace_1',
    createdAt: new Date().toISOString()
  });
}
