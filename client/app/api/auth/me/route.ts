import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    workspaceId: 'workspace_1',
    createdAt: new Date().toISOString()
  });
}
