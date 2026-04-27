import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }
    
    // Mock login - In production, connect to your backend
    const user = {
      id: '1',
      name: email.split('@')[0],
      email,
      role: 'USER',
      workspaceId: 'workspace_1',
    };
    
    const token = Buffer.from(JSON.stringify({ userId: user.id, email })).toString('base64');
    
    return NextResponse.json({
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
