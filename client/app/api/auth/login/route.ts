export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    // Get user from your users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, workspace_id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('User fetch error:', userError);
      // Create user record if it doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user?.id,
          email: email,
          name: email.split('@')[0],
          role: 'USER',
        })
        .select()
        .single();
      
      if (createError) {
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
      
      return NextResponse.json({
        token: data.session?.access_token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          workspaceId: newUser.workspace_id,
        },
      });
    }
    
    return NextResponse.json({
      token: data.session?.access_token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        workspaceId: userData.workspace_id,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
