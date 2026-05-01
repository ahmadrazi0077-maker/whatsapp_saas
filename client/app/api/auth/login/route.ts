import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Simple mock login - accepts any credentials
    const token = Buffer.from(JSON.stringify({ 
      email, 
      userId: 'user_1',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 
    })).toString('base64');
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: 'user_1',
        name: email.split('@')[0],
        email,
        role: 'USER',
        workspaceId: 'workspace_1'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
