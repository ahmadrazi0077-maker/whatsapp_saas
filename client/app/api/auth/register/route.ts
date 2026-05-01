import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    
    const token = Buffer.from(JSON.stringify({ 
      email, 
      userId: 'user_' + Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 
    })).toString('base64');
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: 'user_' + Date.now(),
        name,
        email,
        role: 'USER',
        workspaceId: 'workspace_1'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
