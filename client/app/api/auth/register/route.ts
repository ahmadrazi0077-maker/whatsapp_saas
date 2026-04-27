import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, workspaceName } = body;
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Mock registration - In production, connect to your backend
    const user = {
      id: Date.now().toString(),
      name,
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
