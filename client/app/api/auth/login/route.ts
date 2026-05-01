import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Simple mock response
    const token = Buffer.from(JSON.stringify({ email, exp: Date.now() + 86400000 })).toString('base64');
    
    return NextResponse.json({
      token,
      user: {
        id: '1',
        name: email.split('@')[0],
        email,
        role: 'USER',
        workspaceId: 'workspace_1',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
