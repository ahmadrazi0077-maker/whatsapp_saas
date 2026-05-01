import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Extract token from header
  const authHeader = req.headers.get('authorization');
  let email = 'test@example.com';
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      email = decoded.email;
    } catch (e) {}
  }
  
  return NextResponse.json({
    id: 'user_1',
    name: email.split('@')[0],
    email,
    role: 'USER',
    workspaceId: 'workspace_1'
  });
}
