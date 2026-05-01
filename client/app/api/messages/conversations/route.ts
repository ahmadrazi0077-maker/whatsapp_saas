export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('id', user.id)
      .single()

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        contact:contacts(id, name, phone_number)
      `)
      .eq('workspace_id', userData?.workspace_id)
      .order('last_message_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(conversations || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
