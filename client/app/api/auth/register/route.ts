import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    
    const token = Buffer.from(JSON.stringify({ email, exp: Date.now() + 86400000 })).toString('base64');
    
    return NextResponse.json({
      token,
      user: {
        id: Date.now().toString(),
        name,
        email,
        role: 'USER',
        workspaceId: 'workspace_1',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
