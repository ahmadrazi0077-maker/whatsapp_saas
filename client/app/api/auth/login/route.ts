export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    // Get user from your users table
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, name, role, workspace_id')
      .eq('email', email)
      .single()
    
    return NextResponse.json({
      token: data.session?.access_token,
      user: userData
    })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
