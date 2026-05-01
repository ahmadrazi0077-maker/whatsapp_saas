export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Fetch contacts
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('workspace_id', userData.workspace_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(contacts || []);
  } catch (error) {
    console.error('Error in GET /api/contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, name, email, tags } = body;
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('id', user.id)
      .single();

    if (userDataError) {
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

    if (error) throw error;

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/contacts:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
