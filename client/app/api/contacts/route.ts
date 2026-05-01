export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token?.length);
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token with Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('Token verification error:', userError.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    
    console.log('User authenticated:', user.email);
    
    const body = await request.json();
    const { phoneNumber, name, email, tags } = body;
    
    // Get user's workspace
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      console.error('Workspace fetch error:', userDataError);
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Insert contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        phone_number: phoneNumber,
        name: name || null,
        email: email || null,
        tags: tags || [],
        workspace_id: userData.workspace_id
      })
      .select()
      .single();

    if (error) {
      console.error('Contact insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Contact created:', contact.id);
    return NextResponse.json(contact, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
